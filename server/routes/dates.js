const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Get all market dates (public)
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT md.*,
        (SELECT COUNT(*) FROM vendor_bookings WHERE market_date_id = md.id AND status = 'confirmed') as vendor_count,
        (SELECT COALESCE(SUM(array_length(string_to_array(booth_location, ','), 1)), 0) FROM vendor_bookings WHERE market_date_id = md.id AND status = 'confirmed' AND booth_location IS NOT NULL AND booth_location != '') as spots_used,
        (SELECT value->>'total_spots' FROM settings WHERE key = 'map_config')::int as total_spots
       FROM market_dates md
       ORDER BY md.id ASC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single market date with vendors
router.get('/:id', async (req, res) => {
  try {
    const dateResult = await db.query(
      'SELECT * FROM market_dates WHERE id = $1',
      [req.params.id]
    );

    if (dateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Market date not found' });
    }

    const vendorsResult = await db.query(
      `SELECT v.id, v.business_name, v.description, v.booth_size, vb.booth_location
       FROM vendor_bookings vb
       JOIN vendors v ON vb.vendor_id = v.id
       WHERE vb.market_date_id = $1 AND vb.status = 'confirmed' AND v.is_active = true
       ORDER BY v.business_name`,
      [req.params.id]
    );

    res.json({
      ...dateResult.rows[0],
      vendors: vendorsResult.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create market date (admin only)
router.post('/', verifyToken, isAdmin, async (req, res) => {
  const { date, notes } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO market_dates (date, notes)
       VALUES ($1, $2)
       RETURNING *`,
      [date, notes]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      return res.status(400).json({ error: 'A market is already scheduled for this date' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// Update market date (admin only)
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  const { date, is_cancelled, notes } = req.body;

  try {
    const result = await db.query(
      `UPDATE market_dates
       SET date = COALESCE($1, date),
           is_cancelled = COALESCE($2, is_cancelled),
           notes = COALESCE($3, notes)
       WHERE id = $4
       RETURNING *`,
      [date, is_cancelled, notes, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Market date not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete market date (admin only)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM market_dates WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Market date not found' });
    }

    res.json({ message: 'Market date deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
