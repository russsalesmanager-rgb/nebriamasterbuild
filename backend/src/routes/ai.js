const express = require('express');
const { body, validationResult } = require('express-validator');
const { authMiddleware } = require('../middleware/auth');
const models = require('../models');

const router = express.Router();

// Placeholder for AI chat with selected model
router.post(
  '/chat',
  authMiddleware,
  [
    body('prompt').isLength({ min: 1 }),
    body('model').isIn(['chatgpt', 'gemini', 'grok'])
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { prompt, model } = req.body;
    try {
      // TODO: call external API based on model
      // For demonstration we'll echo the prompt back
      const reply = `Model ${model} would respond to: ${prompt}`;
      // Track usage (not implemented)
      return res.json({ reply });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'AI request failed' });
    }
  }
);

module.exports = router;