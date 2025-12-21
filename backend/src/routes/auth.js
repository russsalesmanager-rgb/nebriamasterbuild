const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const models = require('../models');

const router = express.Router();

// In memory refresh token store (for demonstration). In production
// you should persist refresh tokens in a database or cache with
// revocation capabilities.
const refreshTokens = new Map();

// Register a new user
router.post(
  '/register',
  [
    body('username').isLength({ min: 3 }),
    body('email').isEmail(),
    body('password').isLength({ min: 8 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { username, email, password } = req.body;
    try {
      const existing = await models.User.findOne({ where: { email } });
      if (existing) {
        return res.status(400).json({ error: 'Email already in use' });
      }
      const user = await models.User.create({
        username,
        email,
        passwordHash: password,
        roleId: 5 // USER
      });
      return res.status(201).json({ id: user.id, username: user.username, email: user.email });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Registration failed' });
    }
  }
);

// Login
router.post(
  '/login',
  [body('email').isEmail(), body('password').exists()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      const user = await models.User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      const valid = await user.validPassword(password);
      if (!valid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      const payload = { id: user.id, role: (await user.getRole()).name };
      const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
      const refreshToken = jwt.sign(payload, process.env.REFRESH_SECRET, { expiresIn: '7d' });
      refreshTokens.set(refreshToken, user.id);
      return res.json({ accessToken, refreshToken });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Login failed' });
    }
  }
);

// Refresh token
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ error: 'Missing refreshToken' });
  }
  if (!refreshTokens.has(refreshToken)) {
    return res.status(401).json({ error: 'Invalid refreshToken' });
  }
  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
    const payload = { id: decoded.id, role: decoded.role };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
    return res.json({ accessToken });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid refreshToken' });
  }
});

// Logout (revoke refresh token)
router.post('/logout', (req, res) => {
  const { refreshToken } = req.body;
  if (refreshTokens.has(refreshToken)) {
    refreshTokens.delete(refreshToken);
  }
  res.json({ message: 'Logged out' });
});

module.exports = router;