const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../models/db');
const { verifyToken, isAdmin } = require('../middleware/auth');
const emailService = require('../services/email');

// Get all vendors
router.get('/vendors', verifyToken, isAdmin, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT v.*,
        (SELECT COUNT(*) FROM vendor_bookings WHERE vendor_id = v.id) as booking_count,
        (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE vendor_id = v.id AND status = 'paid') as total_paid
       FROM vendors v
       ORDER BY v.created_at DESC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single vendor
router.get('/vendors/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const vendorResult = await db.query(
      'SELECT * FROM vendors WHERE id = $1',
      [req.params.id]
    );

    if (vendorResult.rows.length === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    const bookingsResult = await db.query(
      `SELECT vb.*, md.date
       FROM vendor_bookings vb
       JOIN market_dates md ON vb.market_date_id = md.id
       WHERE vb.vendor_id = $1
       ORDER BY md.id ASC`,
      [req.params.id]
    );

    const paymentsResult = await db.query(
      'SELECT * FROM payments WHERE vendor_id = $1 ORDER BY created_at DESC',
      [req.params.id]
    );

    res.json({
      vendor: vendorResult.rows[0],
      bookings: bookingsResult.rows,
      payments: paymentsResult.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new vendor
router.post('/vendors', verifyToken, isAdmin, async (req, res) => {
  const {
    email, business_name, contact_name, phone, website,
    social_handles, description, booth_size, needs_power, is_nonprofit, category
  } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO vendors (email, business_name, contact_name, phone, website, social_handles, description, booth_size, needs_power, is_nonprofit, is_approved, category)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true, $11)
       RETURNING *`,
      [email, business_name, contact_name, phone, website, social_handles, description, booth_size || 'single', needs_power || false, is_nonprofit || false, category || 'makers']
    );

    // Send welcome email with setup link
    await emailService.sendWelcomeEmail(result.rows[0]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Vendor with this email already exists' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// Update vendor
router.put('/vendors/:id', verifyToken, isAdmin, async (req, res) => {
  const {
    email, business_name, contact_name, phone, website,
    social_handles, description, booth_size, needs_power, is_nonprofit, is_active, is_approved, category,
    alternate_dates, markets_requested, requested_dates, base_amount, power_fee, total_amount
  } = req.body;

  try {
    const result = await db.query(
      `UPDATE vendors
       SET email = COALESCE($1, email),
           business_name = COALESCE($2, business_name),
           contact_name = COALESCE($3, contact_name),
           phone = COALESCE($4, phone),
           website = COALESCE($5, website),
           social_handles = COALESCE($6, social_handles),
           description = COALESCE($7, description),
           booth_size = COALESCE($8, booth_size),
           needs_power = COALESCE($9, needs_power),
           is_nonprofit = COALESCE($10, is_nonprofit),
           is_active = COALESCE($11, is_active),
           is_approved = COALESCE($12, is_approved),
           category = COALESCE($13, category),
           alternate_dates = COALESCE($14, alternate_dates),
           markets_requested = COALESCE($15, markets_requested),
           requested_dates = COALESCE($16, requested_dates),
           base_amount = COALESCE($17, base_amount),
           power_fee = COALESCE($18, power_fee),
           total_amount = COALESCE($19, total_amount),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $20
       RETURNING *`,
      [email, business_name, contact_name, phone, website, social_handles, description, booth_size, needs_power, is_nonprofit, is_active, is_approved, category, alternate_dates, markets_requested, requested_dates, base_amount, power_fee, total_amount, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Approve vendor application
router.post('/vendors/:id/approve', verifyToken, isAdmin, async (req, res) => {
  try {
    // Get the vendor
    const vendorResult = await db.query('SELECT * FROM vendors WHERE id = $1', [req.params.id]);
    if (vendorResult.rows.length === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    const vendor = vendorResult.rows[0];

    // Set hero image to first uploaded image if available
    let heroImage = vendor.image_url;
    if (!heroImage && vendor.images && vendor.images.length > 0) {
      heroImage = vendor.images[0];
    }

    // Update vendor status
    await db.query(
      `UPDATE vendors
       SET is_active = true,
           is_approved = true,
           application_status = 'approved',
           image_url = COALESCE($2, image_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [req.params.id, heroImage]
    );

    // Create invoice for the total amount
    const invoiceResult = await db.query(
      `INSERT INTO payments (vendor_id, amount, status, description)
       VALUES ($1, $2, 'pending', $3)
       RETURNING *`,
      [
        vendor.id,
        vendor.total_amount || 0,
        `2026 Season - ${vendor.booth_size === 'double' ? 'Double' : 'Single'} Booth (${vendor.markets_requested} markets)${vendor.needs_power ? ' + Power' : ''}`
      ]
    );

    // Create bookings for requested dates (allow override from request body)
    const datesToBook = req.body.requested_dates || vendor.requested_dates;
    if (datesToBook) {
      try {
        const requestedDates = typeof datesToBook === 'string'
          ? JSON.parse(datesToBook)
          : datesToBook;

        if (Array.isArray(requestedDates)) {
          for (const dateStr of requestedDates) {
            // Find the market_date_id for this date
            const marketDateResult = await db.query(
              'SELECT id FROM market_dates WHERE date = $1',
              [dateStr]
            );

            if (marketDateResult.rows.length > 0) {
              // Create the booking
              await db.query(
                `INSERT INTO vendor_bookings (vendor_id, market_date_id, status)
                 VALUES ($1, $2, 'confirmed')
                 ON CONFLICT (vendor_id, market_date_id) DO NOTHING`,
                [vendor.id, marketDateResult.rows[0].id]
              );
            }
          }
        }
      } catch (parseErr) {
        console.error('Error parsing requested dates:', parseErr);
      }
    }

    // Send welcome email with password setup link
    await emailService.sendWelcomeEmail(vendor);

    res.json({
      message: 'Vendor approved successfully',
      vendor: { ...vendor, is_active: true, is_approved: true, application_status: 'approved' },
      invoice: invoiceResult.rows[0]
    });
  } catch (err) {
    console.error('Error approving vendor:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove all bookings for a vendor
router.delete('/vendors/:id/bookings', verifyToken, isAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM vendor_bookings WHERE vendor_id = $1', [req.params.id]);
    res.json({ message: 'All bookings removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete vendor
router.delete('/vendors/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM vendors WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    res.json({ message: 'Vendor deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get date requests (vendor bookings with status 'requested')
router.get('/date-requests', verifyToken, isAdmin, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT vb.id, vb.vendor_id, vb.market_date_id, vb.status,
              v.business_name, v.contact_name,
              md.date
       FROM vendor_bookings vb
       JOIN vendors v ON vb.vendor_id = v.id
       JOIN market_dates md ON vb.market_date_id = md.id
       WHERE vb.status = 'requested'
       ORDER BY md.id ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Review requested bookings — approve and/or deny in one action
router.post('/bookings/review', verifyToken, isAdmin, async (req, res) => {
  const { approve_ids = [], deny_ids = [] } = req.body;

  if (approve_ids.length === 0 && deny_ids.length === 0) {
    return res.status(400).json({ error: 'No bookings specified' });
  }

  try {
    let approvedDates = [];
    let deniedDates = [];
    let vendorId = null;

    // Approve selected
    if (approve_ids.length > 0) {
      const approveResult = await db.query(
        `UPDATE vendor_bookings
         SET status = 'confirmed'
         WHERE id = ANY($1) AND status = 'requested'
         RETURNING *`,
        [approve_ids]
      );
      if (approveResult.rows.length > 0) {
        vendorId = approveResult.rows[0].vendor_id;
        const dateIds = approveResult.rows.map(r => r.market_date_id);
        const datesResult = await db.query(
          'SELECT date FROM market_dates WHERE id = ANY($1) ORDER BY id ASC',
          [dateIds]
        );
        approvedDates = datesResult.rows.map(d => d.date);
      }
    }

    // Deny selected (delete the booking)
    if (deny_ids.length > 0) {
      // Get the dates before deleting so we can include in email
      const denyInfo = await db.query(
        `SELECT vb.vendor_id, md.date
         FROM vendor_bookings vb
         JOIN market_dates md ON vb.market_date_id = md.id
         WHERE vb.id = ANY($1)`,
        [deny_ids]
      );
      if (denyInfo.rows.length > 0) {
        vendorId = vendorId || denyInfo.rows[0].vendor_id;
        deniedDates = denyInfo.rows.map(r => r.date);
      }

      await db.query(
        `DELETE FROM vendor_bookings WHERE id = ANY($1) AND status = 'requested'`,
        [deny_ids]
      );
    }

    // Send one email with all decisions
    if (vendorId && (approvedDates.length > 0 || deniedDates.length > 0)) {
      const vendorResult = await db.query(
        'SELECT id, contact_name, email, business_name FROM vendors WHERE id = $1',
        [vendorId]
      );
      if (vendorResult.rows[0]) {
        await emailService.sendDateRequestApproval(
          vendorResult.rows[0],
          approvedDates,
          deniedDates
        );
      }
    }

    res.json({ success: true, approved: approvedDates.length, denied: deniedDates.length });
  } catch (err) {
    console.error('Error reviewing bookings:', err);
    res.status(500).json({ error: 'Failed to review bookings' });
  }
});

// Assign vendor to market date
router.post('/bookings', verifyToken, isAdmin, async (req, res) => {
  const { vendor_id, market_date_id, booth_location, status } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO vendor_bookings (vendor_id, market_date_id, booth_location, status)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (vendor_id, market_date_id)
       DO UPDATE SET booth_location = $3, status = $4
       RETURNING *`,
      [vendor_id, market_date_id, booth_location, status || 'confirmed']
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove booking
router.delete('/bookings/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM vendor_bookings WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({ message: 'Booking removed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete payment/invoice
router.delete('/payments/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM payments WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json({ message: 'Payment deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create initial admin (one-time setup)
router.post('/setup', async (req, res) => {
  const { email, password, name, setupKey } = req.body;

  // Simple setup key verification (change this in production)
  if (setupKey !== process.env.ADMIN_SETUP_KEY) {
    return res.status(403).json({ error: 'Invalid setup key' });
  }

  try {
    // Check if any admin exists
    const existing = await db.query('SELECT COUNT(*) FROM admin_users');
    if (parseInt(existing.rows[0].count) > 0) {
      return res.status(400).json({ error: 'Admin already exists. Use forgot password if needed.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await db.query(
      'INSERT INTO admin_users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name',
      [email, passwordHash, name]
    );

    res.status(201).json({ message: 'Admin created successfully', admin: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
