const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const emailService = require('../services/email');
const db = require('../models/db');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Submit contact form
router.post('/',
  [
    body('name').notEmpty().trim(),
    body('email').isEmail().normalizeEmail(),
    body('reason').notEmpty().trim(),
    body('question').notEmpty().trim()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Please fill in all required fields.' });
    }

    const { name, email, phone, reason, question } = req.body;

    try {
      // Save to database first
      await db.query(
        'INSERT INTO contact_submissions (name, email, phone, reason, question) VALUES ($1, $2, $3, $4, $5)',
        [name, email, phone || null, reason, question]
      );

      // Send email notification to admin
      await emailService.sendContactFormNotification({
        name,
        email,
        phone: phone || 'Not provided',
        reason,
        question
      });

      res.json({ message: 'Message sent successfully!' });
    } catch (err) {
      console.error('Error sending contact form:', err);
      res.status(500).json({ error: 'Failed to send message. Please try again.' });
    }
  }
);

// Admin: get all contact submissions
router.get('/submissions', verifyToken, isAdmin, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM contact_submissions ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching contact submissions:', err);
    res.status(500).json({ error: 'Failed to fetch submissions.' });
  }
});

module.exports = router;
