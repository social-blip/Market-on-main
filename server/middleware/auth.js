const jwt = require('jsonwebtoken');
const db = require('../models/db');

// Verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Check if user is a vendor
const isVendor = async (req, res, next) => {
  if (req.user.role !== 'vendor') {
    return res.status(403).json({ error: 'Access denied. Vendors only.' });
  }

  try {
    const result = await db.query(
      'SELECT * FROM vendors WHERE id = $1 AND is_active = true',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'Vendor not found or inactive' });
    }

    req.vendor = result.rows[0];
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
};

// Check if user is an admin
const isAdmin = async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }

  try {
    const result = await db.query(
      'SELECT * FROM admin_users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'Admin not found' });
    }

    req.admin = result.rows[0];
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { verifyToken, isVendor, isAdmin };
