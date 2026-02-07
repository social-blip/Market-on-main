const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const emailService = require('../services/email');

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

module.exports = router;
