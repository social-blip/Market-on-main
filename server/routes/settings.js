const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Get a setting by key (public for map_config)
router.get('/:key', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT value FROM settings WHERE key = $1',
      [req.params.key]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Setting not found' });
    }

    res.json(result.rows[0].value);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a setting (admin only)
router.put('/:key', verifyToken, isAdmin, async (req, res) => {
  const { value } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO settings (key, value, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()
       RETURNING *`,
      [req.params.key, JSON.stringify(value)]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
