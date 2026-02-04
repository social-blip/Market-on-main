const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { body, validationResult } = require('express-validator');
const emailService = require('../services/email');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Submit music application (public)
router.post('/submit',
  [
    body('name').notEmpty().trim(),
    body('email').isEmail().normalizeEmail(),
    body('phone').notEmpty().trim(),
    body('message').optional().trim()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      email,
      phone,
      facebook,
      instagram,
      x_handle,
      youtube,
      message
    } = req.body;

    try {
      // Combine social handles into one field
      const socialHandles = JSON.stringify({
        facebook: facebook || null,
        instagram: instagram || null,
        x: x_handle || null,
        youtube: youtube || null
      });

      // Insert application
      const result = await db.query(
        `INSERT INTO music_applications (
          name, email, phone, social_handles, message, status
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, name, email, created_at`,
        [
          name,
          email,
          phone,
          socialHandles,
          message || null,
          'pending'
        ]
      );

      // Send confirmation email (CC to admin)
      const applicationData = {
        id: result.rows[0].id,
        name,
        email,
        phone,
        facebook,
        instagram,
        x_handle,
        youtube,
        message
      };
      await emailService.sendMusicApplicationConfirmation(applicationData);

      res.status(201).json({
        message: 'Application submitted successfully!',
        application: result.rows[0]
      });
    } catch (err) {
      console.error('Error submitting music application:', err);
      res.status(500).json({ error: 'Failed to submit application' });
    }
  }
);

// Get all music applications (admin only)
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM music_applications ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching music applications:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single music application (admin only)
router.get('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM music_applications WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching music application:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update music application status (admin only)
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  const { status, admin_notes } = req.body;

  try {
    const result = await db.query(
      `UPDATE music_applications
       SET status = COALESCE($1, status),
           admin_notes = COALESCE($2, admin_notes),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [status, admin_notes, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating music application:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete music application (admin only)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM music_applications WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json({ message: 'Application deleted successfully' });
  } catch (err) {
    console.error('Error deleting music application:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
