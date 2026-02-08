const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../models/db');
const { verifyToken, isVendor } = require('../middleware/auth');
const compressUpload = require('../middleware/compressUpload');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Configure multer for vendor photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/vendors'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|heic|heif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  }
});

// Get all active vendors (public)
router.get('/public', async (req, res) => {
  try {
    const { date } = req.query;
    let result;

    if (date) {
      // Filter vendors by specific market date
      result = await db.query(
        `SELECT DISTINCT v.id, v.business_name, v.description, v.category, v.booth_size, v.image_url,
                (SELECT COUNT(*) FROM vendor_bookings WHERE vendor_id = v.id AND status = 'confirmed') as market_count
         FROM vendors v
         JOIN vendor_bookings vb ON v.id = vb.vendor_id
         JOIN market_dates md ON vb.market_date_id = md.id
         WHERE v.is_active = true AND v.is_approved = true
           AND vb.status = 'confirmed'
           AND md.date = $1
         ORDER BY v.business_name ASC`,
        [date]
      );
    } else {
      result = await db.query(
        `SELECT id, business_name, description, category, booth_size, image_url,
                (SELECT COUNT(*) FROM vendor_bookings WHERE vendor_id = vendors.id AND status = 'confirmed') as market_count
         FROM vendors
         WHERE is_active = true AND is_approved = true
         ORDER BY business_name ASC`
      );
    }

    // Get upcoming dates for each vendor
    const vendorsWithDates = await Promise.all(
      result.rows.map(async (vendor) => {
        const datesResult = await db.query(
          `SELECT md.date
           FROM vendor_bookings vb
           JOIN market_dates md ON vb.market_date_id = md.id
           WHERE vb.vendor_id = $1 AND vb.status = 'confirmed'
           ORDER BY md.id ASC
           LIMIT 1`,
          [vendor.id]
        );
        return {
          ...vendor,
          market_count: parseInt(vendor.market_count) || 0,
          next_date: datesResult.rows[0]?.date || null
        };
      })
    );

    res.json(vendorsWithDates);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single vendor details (public)
router.get('/public/:id', async (req, res) => {
  try {
    const vendorResult = await db.query(
      `SELECT id, business_name, description, category, booth_size, image_url, images, website, social_handles
       FROM vendors
       WHERE id = $1 AND is_active = true AND is_approved = true`,
      [req.params.id]
    );

    if (vendorResult.rows.length === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    // Get vendor's upcoming market dates
    const datesResult = await db.query(
      `SELECT md.date
       FROM vendor_bookings vb
       JOIN market_dates md ON vb.market_date_id = md.id
       WHERE vb.vendor_id = $1 AND vb.status = 'confirmed'
       ORDER BY md.id ASC`,
      [req.params.id]
    );

    res.json({
      ...vendorResult.rows[0],
      upcoming_dates: datesResult.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get vendor profile
router.get('/profile', verifyToken, isVendor, async (req, res) => {
  try {
    res.json(req.vendor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update vendor profile
router.put('/profile', verifyToken, isVendor, async (req, res) => {
  const { phone, website, social_handles, description } = req.body;

  try {
    const result = await db.query(
      `UPDATE vendors
       SET phone = COALESCE($1, phone),
           website = COALESCE($2, website),
           social_handles = COALESCE($3, social_handles),
           description = COALESCE($4, description),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [phone, website, social_handles, description, req.vendor.id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get vendor's bookings
router.get('/bookings', verifyToken, isVendor, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT vb.*, md.date, md.is_cancelled
       FROM vendor_bookings vb
       JOIN market_dates md ON vb.market_date_id = md.id
       WHERE vb.vendor_id = $1
       ORDER BY md.id ASC`,
      [req.vendor.id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get vendor's payments
router.get('/payments', verifyToken, isVendor, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM payments
       WHERE vendor_id = $1
       ORDER BY created_at DESC`,
      [req.vendor.id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get announcements for vendor (with read status)
router.get('/announcements', verifyToken, isVendor, async (req, res) => {
  try {
    const vendorId = req.user.id;
    const result = await db.query(
      `SELECT a.*,
              CASE WHEN ar.id IS NOT NULL THEN true ELSE false END as is_read
       FROM announcements a
       LEFT JOIN announcement_reads ar ON a.id = ar.announcement_id AND ar.vendor_id = $1
       ORDER BY a.created_at DESC
       LIMIT 20`,
      [vendorId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark announcement as read
router.post('/announcements/:id/read', verifyToken, isVendor, async (req, res) => {
  try {
    const vendorId = req.user.id;
    const announcementId = req.params.id;

    await db.query(
      `INSERT INTO announcement_reads (announcement_id, vendor_id)
       VALUES ($1, $2)
       ON CONFLICT (announcement_id, vendor_id) DO NOTHING`,
      [announcementId, vendorId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create payment intent for vendor to pay their invoice
router.post('/payments/:id/create-payment-intent', verifyToken, isVendor, async (req, res) => {
  try {
    // Get payment and verify vendor ownership
    const paymentResult = await db.query(
      `SELECT p.*, v.email, v.business_name, v.contact_name
       FROM payments p
       JOIN vendors v ON p.vendor_id = v.id
       WHERE p.id = $1 AND p.vendor_id = $2`,
      [req.params.id, req.vendor.id]
    );

    if (paymentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const payment = paymentResult.rows[0];

    // Check if already paid
    if (payment.status === 'paid') {
      return res.status(400).json({ error: 'This invoice has already been paid' });
    }

    // Create PaymentIntent for exact invoice amount (no fee added)
    const amountInCents = Math.round(parseFloat(payment.amount) * 100);

    // Create or retrieve Stripe customer for tracking
    let customer;
    const existingCustomers = await stripe.customers.list({
      email: payment.email,
      limit: 1
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: payment.email,
        name: payment.contact_name || payment.business_name,
        metadata: {
          vendor_id: payment.vendor_id,
          business_name: payment.business_name
        }
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      customer: customer.id,
      description: `Market on Main - ${payment.description || 'Vendor fees'}`,
      receipt_email: payment.email,
      metadata: {
        payment_id: payment.id,
        vendor_id: payment.vendor_id,
        business_name: payment.business_name
      }
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('Error creating payment intent:', err);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// Request additional market dates
router.post('/request-dates', verifyToken, isVendor, async (req, res) => {
  const { market_date_ids } = req.body;

  if (!market_date_ids || !Array.isArray(market_date_ids) || market_date_ids.length === 0) {
    return res.status(400).json({ error: 'Please select at least one date' });
  }

  try {
    let requested = 0;

    for (const dateId of market_date_ids) {
      const result = await db.query(
        `INSERT INTO vendor_bookings (vendor_id, market_date_id, status)
         VALUES ($1, $2, 'requested')
         ON CONFLICT (vendor_id, market_date_id) DO NOTHING`,
        [req.vendor.id, dateId]
      );
      if (result.rowCount > 0) requested++;
    }

    // Get vendor info and date details for notification email
    if (requested > 0) {
      const datesResult = await db.query(
        `SELECT date FROM market_dates WHERE id = ANY($1) ORDER BY id ASC`,
        [market_date_ids]
      );

      const emailService = require('../services/email');
      await emailService.sendDateRequestNotification(req.vendor, datesResult.rows);
    }

    res.json({ success: true, requested });
  } catch (err) {
    console.error('Error requesting dates:', err);
    res.status(500).json({ error: 'Failed to submit date request' });
  }
});

// Upload vendor photos
router.post('/photos', verifyToken, isVendor, upload.array('photos', 10), compressUpload, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // Get current images
    const currentResult = await db.query(
      'SELECT images, image_url FROM vendors WHERE id = $1',
      [req.vendor.id]
    );

    const currentImages = currentResult.rows[0]?.images || [];
    const currentHero = currentResult.rows[0]?.image_url;

    // Add new image paths
    const newImages = req.files.map(f => `/uploads/vendors/${f.filename}`);
    const allImages = [...currentImages, ...newImages];

    // If no hero image set, use the first uploaded image
    const heroImage = currentHero || newImages[0];

    // Update database
    const result = await db.query(
      `UPDATE vendors
       SET images = $1, image_url = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING id, images, image_url`,
      [allImages, heroImage, req.vendor.id]
    );

    res.json({
      message: 'Photos uploaded successfully',
      images: result.rows[0].images,
      image_url: result.rows[0].image_url
    });
  } catch (err) {
    console.error('Error uploading photos:', err);
    res.status(500).json({ error: 'Failed to upload photos' });
  }
});

// Set hero photo
router.put('/photos/hero', verifyToken, isVendor, async (req, res) => {
  const { image_url } = req.body;

  try {
    // Verify the image is in the vendor's images array
    const currentResult = await db.query(
      'SELECT images FROM vendors WHERE id = $1',
      [req.vendor.id]
    );

    const images = currentResult.rows[0]?.images || [];
    if (!images.includes(image_url)) {
      return res.status(400).json({ error: 'Invalid image selection' });
    }

    const result = await db.query(
      `UPDATE vendors
       SET image_url = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, images, image_url`,
      [image_url, req.vendor.id]
    );

    res.json({
      message: 'Hero photo updated',
      images: result.rows[0].images,
      image_url: result.rows[0].image_url
    });
  } catch (err) {
    console.error('Error setting hero photo:', err);
    res.status(500).json({ error: 'Failed to set hero photo' });
  }
});

// Delete a photo
router.delete('/photos', verifyToken, isVendor, async (req, res) => {
  const { image_url } = req.body;

  try {
    const currentResult = await db.query(
      'SELECT images, image_url FROM vendors WHERE id = $1',
      [req.vendor.id]
    );

    const images = currentResult.rows[0]?.images || [];
    const currentHero = currentResult.rows[0]?.image_url;

    if (!images.includes(image_url)) {
      return res.status(400).json({ error: 'Image not found' });
    }

    // Remove from array
    const updatedImages = images.filter(img => img !== image_url);

    // If deleting hero image, set new hero to first remaining image or null
    let newHero = currentHero;
    if (currentHero === image_url) {
      newHero = updatedImages.length > 0 ? updatedImages[0] : null;
    }

    const result = await db.query(
      `UPDATE vendors
       SET images = $1, image_url = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING id, images, image_url`,
      [updatedImages, newHero, req.vendor.id]
    );

    // Try to delete the actual file
    try {
      const filePath = path.join(__dirname, '..', image_url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (fileErr) {
      console.error('Error deleting file:', fileErr);
      // Continue even if file deletion fails
    }

    res.json({
      message: 'Photo deleted',
      images: result.rows[0].images,
      image_url: result.rows[0].image_url
    });
  } catch (err) {
    console.error('Error deleting photo:', err);
    res.status(500).json({ error: 'Failed to delete photo' });
  }
});

// Get vendor photos
router.get('/photos', verifyToken, isVendor, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT images, image_url FROM vendors WHERE id = $1',
      [req.vendor.id]
    );

    res.json({
      images: result.rows[0]?.images || [],
      image_url: result.rows[0]?.image_url || null
    });
  } catch (err) {
    console.error('Error fetching photos:', err);
    res.status(500).json({ error: 'Failed to fetch photos' });
  }
});

module.exports = router;
