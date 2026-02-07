const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { verifyToken, isAdmin } = require('../middleware/auth');

// ===================
// PUBLIC ROUTES
// ===================

// Get full schedule grouped by date
router.get('/schedule', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM music_schedule
       WHERE performance_date >= CURRENT_DATE
       ORDER BY performance_date ASC, time_slot ASC`
    );

    // Group by date
    const grouped = {};
    result.rows.forEach(row => {
      const dateKey = row.performance_date;
      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          date: row.performance_date,
          slot1: null,
          slot2: null
        };
      }
      if (row.time_slot === 'slot1' && row.performer_name) {
        grouped[dateKey].slot1 = { name: row.performer_name, url: row.performer_url };
      } else if (row.time_slot === 'slot2' && row.performer_name) {
        grouped[dateKey].slot2 = { name: row.performer_name, url: row.performer_url };
      }
    });

    res.json(Object.values(grouped));
  } catch (err) {
    console.error('Error fetching music schedule:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get upcoming schedule grouped by date (for homepage)
router.get('/schedule/upcoming', async (req, res) => {
  const limit = parseInt(req.query.limit) || 6;
  try {
    const result = await db.query(
      `SELECT ms.performance_date, ms.time_slot,
              COALESCE(ma.name, ms.performer_name) as performer_name,
              COALESCE(ma.website, ms.performer_url) as performer_url,
              COALESCE(ma.bio, ms.bio) as bio,
              ma.website
       FROM music_schedule ms
       LEFT JOIN music_applications ma ON ms.application_id = ma.id
       WHERE ms.performance_date >= CURRENT_DATE
       ORDER BY ms.performance_date ASC`
    );

    // Group by date
    const grouped = {};
    result.rows.forEach(row => {
      const dateKey = row.performance_date.toISOString().split('T')[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          date: row.performance_date,
          slot1: null,
          slot2: null
        };
      }
      const slotData = row.performer_name ? {
        name: row.performer_name,
        url: row.performer_url,
        bio: row.bio || null,
        website: row.website || null
      } : null;
      if (row.time_slot === 'slot1') {
        grouped[dateKey].slot1 = slotData;
      } else if (row.time_slot === 'slot2') {
        grouped[dateKey].slot2 = slotData;
      }
    });

    // Return as array, limited
    const dates = Object.values(grouped).slice(0, limit);
    res.json(dates);
  } catch (err) {
    console.error('Error fetching upcoming music:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ===================
// ADMIN ROUTES
// ===================

// Get schedule builder data - all dates with assignments
router.get('/admin/schedule-builder', verifyToken, isAdmin, async (req, res) => {
  try {
    // Get all market dates
    const datesResult = await db.query(
      `SELECT id, date FROM market_dates WHERE is_cancelled = false ORDER BY date ASC`
    );

    // Get all schedule entries with musician info
    const scheduleResult = await db.query(
      `SELECT ms.id, ms.performance_date, ms.time_slot, ms.application_id,
              ms.performer_name, ms.performer_url, ms.bio,
              ma.name as musician_name, ma.email as musician_email
       FROM music_schedule ms
       LEFT JOIN music_applications ma ON ms.application_id = ma.id
       ORDER BY ms.performance_date ASC`
    );

    // Get booked musicians (available to assign)
    const musiciansResult = await db.query(
      `SELECT id, name, email, phone FROM music_applications ORDER BY name ASC`
    );

    // Build schedule map
    const scheduleMap = {};
    scheduleResult.rows.forEach(row => {
      const dateKey = row.performance_date.toISOString().split('T')[0];
      if (!scheduleMap[dateKey]) {
        scheduleMap[dateKey] = {};
      }
      scheduleMap[dateKey][row.time_slot] = {
        id: row.id,
        application_id: row.application_id,
        musician_name: row.musician_name || row.performer_name || null,
        musician_email: row.musician_email,
        performer_name: row.performer_name,
        bio: row.bio
      };
    });

    res.json({
      dates: datesResult.rows,
      schedule: scheduleMap,
      musicians: musiciansResult.rows
    });
  } catch (err) {
    console.error('Error fetching schedule builder data:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Assign musician to a slot
router.post('/admin/schedule/assign', verifyToken, isAdmin, async (req, res) => {
  const { performance_date, time_slot, application_id } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO music_schedule (performance_date, time_slot, application_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (performance_date, time_slot)
       DO UPDATE SET application_id = $3, performer_name = NULL, performer_url = NULL
       RETURNING *`,
      [performance_date, time_slot, application_id || null]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error assigning musician:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all schedule entries
router.get('/admin/schedule', verifyToken, isAdmin, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM music_schedule ORDER BY performance_date ASC, time_slot ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching music schedule:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create/update a schedule entry
router.post('/admin/schedule', verifyToken, isAdmin, async (req, res) => {
  const { performance_date, time_slot, performer_name, performer_url } = req.body;

  try {
    // Upsert - update if exists, insert if not
    const result = await db.query(
      `INSERT INTO music_schedule (performance_date, time_slot, performer_name, performer_url)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (performance_date, time_slot)
       DO UPDATE SET performer_name = $3, performer_url = $4
       RETURNING *`,
      [performance_date, time_slot, performer_name || null, performer_url || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error saving schedule entry:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a schedule entry's bio
router.put('/admin/schedule/:id/bio', verifyToken, isAdmin, async (req, res) => {
  const { bio } = req.body;
  try {
    const result = await db.query(
      'UPDATE music_schedule SET bio = $1 WHERE id = $2 RETURNING *',
      [bio, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Schedule entry not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating schedule bio:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a schedule entry
router.delete('/admin/schedule/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM music_schedule WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Schedule entry not found' });
    }

    res.json({ message: 'Schedule entry deleted successfully' });
  } catch (err) {
    console.error('Error deleting schedule entry:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
