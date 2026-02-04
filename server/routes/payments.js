const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { verifyToken, isAdmin } = require('../middleware/auth');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const emailService = require('../services/email');

// Get all payments (admin)
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT p.*, v.business_name, v.contact_name, v.email
       FROM payments p
       JOIN vendors v ON p.vendor_id = v.id
       ORDER BY p.created_at DESC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create payment record (admin)
router.post('/', verifyToken, isAdmin, async (req, res) => {
  const { vendor_id, amount, description, due_date } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO payments (vendor_id, amount, description, due_date)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [vendor_id, amount, description, due_date]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update payment (admin)
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  const { amount, description, status, due_date, paid_date } = req.body;

  try {
    const result = await db.query(
      `UPDATE payments
       SET amount = COALESCE($1, amount),
           description = COALESCE($2, description),
           status = COALESCE($3, status),
           due_date = COALESCE($4, due_date),
           paid_date = COALESCE($5, paid_date),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [amount, description, status, due_date, paid_date, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark payment as paid (admin - manual)
router.post('/:id/mark-paid', verifyToken, isAdmin, async (req, res) => {
  try {
    const result = await db.query(
      `UPDATE payments
       SET status = 'paid',
           paid_date = CURRENT_DATE,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Get vendor info for email
    const vendor = await db.query(
      'SELECT * FROM vendors WHERE id = $1',
      [result.rows[0].vendor_id]
    );

    if (vendor.rows.length > 0) {
      await emailService.sendPaymentConfirmation(vendor.rows[0], result.rows[0]);
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Process Stripe payment (admin)
router.post('/:id/charge', verifyToken, isAdmin, async (req, res) => {
  const { payment_method_id } = req.body;

  try {
    // Get payment and vendor info
    const paymentResult = await db.query(
      `SELECT p.*, v.email, v.business_name, v.contact_name
       FROM payments p
       JOIN vendors v ON p.vendor_id = v.id
       WHERE p.id = $1`,
      [req.params.id]
    );

    if (paymentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const payment = paymentResult.rows[0];

    // Calculate amount with 3% fee
    const amountWithFee = Math.round(payment.amount * 1.03 * 100); // Convert to cents

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountWithFee,
      currency: 'usd',
      payment_method: payment_method_id,
      confirm: true,
      description: `Market on Main - ${payment.description}`,
      receipt_email: payment.email,
      metadata: {
        payment_id: payment.id,
        vendor_id: payment.vendor_id,
        business_name: payment.business_name
      }
    });

    // Update payment record
    const updateResult = await db.query(
      `UPDATE payments
       SET status = 'paid',
           paid_date = CURRENT_DATE,
           stripe_payment_id = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [paymentIntent.id, req.params.id]
    );

    // Send confirmation email
    await emailService.sendPaymentConfirmation(
      { email: payment.email, contact_name: payment.contact_name, business_name: payment.business_name },
      updateResult.rows[0]
    );

    res.json({
      payment: updateResult.rows[0],
      stripe: paymentIntent
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Payment processing failed' });
  }
});

// Stripe webhook handler (raw body middleware applied in index.js)
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;

      if (paymentIntent.metadata.payment_id) {
        await db.query(
          `UPDATE payments
           SET status = 'paid',
               paid_date = CURRENT_DATE,
               stripe_payment_id = $1,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $2`,
          [paymentIntent.id, paymentIntent.metadata.payment_id]
        );
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Webhook error' });
  }
});

module.exports = router;
