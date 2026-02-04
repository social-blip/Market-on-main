const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../models/db');
const { verifyToken } = require('../middleware/auth');

// Generate JWT token
const generateToken = (user, role) => {
  return jwt.sign(
    { id: user.id, email: user.email, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Vendor Login
router.post('/vendor/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const result = await db.query(
      'SELECT * FROM vendors WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const vendor = result.rows[0];

    if (!vendor.password_hash) {
      return res.status(401).json({ error: 'Please set up your password first' });
    }

    const isMatch = await bcrypt.compare(password, vendor.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!vendor.is_active) {
      return res.status(401).json({ error: 'Your account is inactive' });
    }

    const token = generateToken(vendor, 'vendor');

    res.json({
      token,
      user: {
        id: vendor.id,
        email: vendor.email,
        businessName: vendor.business_name,
        contactName: vendor.contact_name,
        role: 'vendor'
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin Login
router.post('/admin/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const result = await db.query(
      'SELECT * FROM admin_users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const admin = result.rows[0];

    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(admin, 'admin');

    res.json({
      token,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: 'admin'
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Vendor Registration (set password for first time)
router.post('/vendor/setup-password', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('token').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, token } = req.body;

  try {
    // Verify setup token (simple implementation - in production use a proper token system)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.email !== email || decoded.purpose !== 'setup') {
      return res.status(400).json({ error: 'Invalid setup token' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await db.query(
      'UPDATE vendors SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE email = $2 RETURNING *',
      [passwordHash, email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    const vendor = result.rows[0];
    const authToken = generateToken(vendor, 'vendor');

    res.json({
      token: authToken,
      user: {
        id: vendor.id,
        email: vendor.email,
        businessName: vendor.business_name,
        contactName: vendor.contact_name,
        role: 'vendor'
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current user
router.get('/me', verifyToken, async (req, res) => {
  try {
    if (req.user.role === 'vendor') {
      const result = await db.query(
        'SELECT id, email, business_name, contact_name, phone, website, social_handles, description, booth_size, needs_power, is_nonprofit FROM vendors WHERE id = $1',
        [req.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Vendor not found' });
      }

      res.json({ ...result.rows[0], role: 'vendor' });
    } else if (req.user.role === 'admin') {
      const result = await db.query(
        'SELECT id, email, name, role FROM admin_users WHERE id = $1',
        [req.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Admin not found' });
      }

      res.json({ ...result.rows[0], role: 'admin' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
