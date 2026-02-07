const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../models/db');
const { body, validationResult } = require('express-validator');
const emailService = require('../services/email');
const compressUpload = require('../middleware/compressUpload');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/applications'));
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
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  }
});

// Pricing configuration
const PRICING = {
  single: {
    10: 500,
    6: 350,
    3: 195
  },
  double: {
    10: 750,
    6: 550,
    3: 290
  }
};

const POWER_FEE = 15;

// Calculate total amount
const calculateTotal = (boothSize, marketsRequested, needsPower) => {
  const baseAmount = PRICING[boothSize]?.[marketsRequested] || 0;
  const powerFee = needsPower ? POWER_FEE : 0;
  const totalAmount = baseAmount + powerFee;

  return {
    baseAmount,
    powerFee,
    totalAmount
  };
};

// Submit vendor application
router.post('/submit',
  upload.array('images', 5),
  compressUpload,
  [
    body('contact_name').notEmpty().trim(),
    body('business_name').notEmpty().trim(),
    body('email').isEmail().normalizeEmail(),
    body('phone').notEmpty().trim(),
    body('website').notEmpty().trim(),
    body('description').notEmpty().trim(),
    body('booth_size').isIn(['single', 'double']),
    body('markets_requested').isIn(['3', '6', '10']),
    body('requested_dates').notEmpty(),
    body('needs_power').custom(value => ['true', 'false', true, false].includes(value)),
    body('is_nonprofit').custom(value => ['true', 'false', true, false].includes(value)),
    body('agreements').notEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array().map(e => e.msg).join(', '), errors: errors.array() });
    }

    const {
      contact_name,
      business_name,
      email,
      phone,
      website,
      social_handles,
      description,
      booth_size,
      markets_requested,
      requested_dates,
      needs_power,
      is_nonprofit,
      agreements
    } = req.body;

    try {
      // Check for existing application
      const existing = await db.query(
        'SELECT id FROM vendors WHERE email = $1',
        [email]
      );

      if (existing.rows.length > 0) {
        return res.status(400).json({
          error: 'An application with this email already exists. Please contact us if you need to update your application.'
        });
      }

      // Calculate pricing
      const pricing = calculateTotal(
        booth_size,
        parseInt(markets_requested),
        needs_power === 'true' || needs_power === true
      );

      // Process uploaded images
      const imageUrls = req.files ? req.files.map(f => `/uploads/applications/${f.filename}`) : [];

      // Parse JSON fields
      const parsedDates = typeof requested_dates === 'string' ? JSON.parse(requested_dates) : requested_dates;
      const parsedAgreements = typeof agreements === 'string' ? JSON.parse(agreements) : agreements;

      // Insert application
      const result = await db.query(
        `INSERT INTO vendors (
          contact_name, business_name, email, phone, website, social_handles,
          description, booth_size, markets_requested, requested_dates,
          needs_power, is_nonprofit,
          base_amount, power_fee, total_amount,
          agreements, images, application_status, is_active, is_approved
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
        RETURNING id, business_name, email, total_amount, application_status`,
        [
          contact_name,
          business_name,
          email,
          phone,
          website,
          social_handles || null,
          description,
          booth_size,
          parseInt(markets_requested),
          JSON.stringify(parsedDates),
          needs_power === 'true' || needs_power === true,
          is_nonprofit === 'true' || is_nonprofit === true,
          pricing.baseAmount,
          pricing.powerFee,
          pricing.totalAmount,
          JSON.stringify(parsedAgreements),
          imageUrls,
          'pending',
          false,
          false
        ]
      );

      // Send confirmation email
      const vendorData = {
        id: result.rows[0].id,
        email,
        contact_name,
        business_name,
        booth_size,
        markets_requested: parseInt(markets_requested),
        total_amount: pricing.totalAmount
      };
      await emailService.sendApplicationConfirmation(vendorData);

      res.status(201).json({
        message: 'Application submitted successfully!',
        application: result.rows[0]
      });
    } catch (err) {
      console.error('Error submitting application:', err);
      res.status(500).json({ error: err.message || 'Failed to submit application' });
    }
  }
);

// Get pricing info (public)
router.get('/pricing', (req, res) => {
  res.json({
    pricing: PRICING,
    powerFee: POWER_FEE
  });
});

module.exports = router;
