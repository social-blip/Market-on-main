const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { verifyToken, isAdmin } = require('../middleware/auth');
const emailService = require('../services/email');

// Get public announcements
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT a.*, au.name as author_name
       FROM announcements a
       LEFT JOIN admin_users au ON a.created_by = au.id
       WHERE a.is_public = true
       ORDER BY a.created_at DESC
       LIMIT 10`
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all announcements (admin)
router.get('/all', verifyToken, isAdmin, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT a.*, au.name as author_name
       FROM announcements a
       LEFT JOIN admin_users au ON a.created_by = au.id
       ORDER BY a.created_at DESC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create announcement (admin)
router.post('/', verifyToken, isAdmin, async (req, res) => {
  const { title, content, is_public, send_email } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO announcements (title, content, is_public, created_by)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [title, content, is_public || false, req.admin.id]
    );

    const announcement = result.rows[0];

    // Send email to all active vendors if requested
    if (send_email) {
      const vendors = await db.query(
        'SELECT email, contact_name FROM vendors WHERE is_active = true'
      );

      for (const vendor of vendors.rows) {
        await emailService.sendAnnouncementEmail(vendor, announcement);
      }
    }

    res.status(201).json(announcement);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update announcement (admin)
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  const { title, content, is_public } = req.body;

  try {
    const result = await db.query(
      `UPDATE announcements
       SET title = COALESCE($1, title),
           content = COALESCE($2, content),
           is_public = COALESCE($3, is_public),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [title, content, is_public, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete announcement (admin)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM announcements WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    res.json({ message: 'Announcement deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
