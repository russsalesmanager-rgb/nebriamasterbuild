const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const models = require('../models');

const router = express.Router();

// In memory refresh token store (for demonstration). In production
// you should persist refresh tokens in a database or cache with
// revocation capabilities.
const refreshTokens = new Map();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 */
router.post(
  '/register',
  [
    body('username').isLength({ min: 3, max: 50 }).trim(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        ok: false, 
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: errors.array() } 
      });
    }
    
    const { username, email, password } = req.body;
    
    try {
      // Check for existing email
      const existingEmail = await models.User.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(400).json({ 
          ok: false, 
          error: { code: 'EMAIL_EXISTS', message: 'Email already in use' } 
        });
      }
      
      // Check for existing username
      const existingUsername = await models.User.findOne({ where: { username } });
      if (existingUsername) {
        return res.status(400).json({ 
          ok: false, 
          error: { code: 'USERNAME_EXISTS', message: 'Username already taken' } 
        });
      }
      
      const user = await models.User.create({
        username,
        email,
        passwordHash: password,
        roleId: 5 // USER
      });
      
      return res.status(201).json({ 
        ok: true, 
        data: { 
          id: user.id, 
          username: user.username, 
          email: user.email,
          message: 'Registration successful'
        } 
      });
    } catch (err) {
      console.error('Registration error:', err);
      return res.status(500).json({ 
        ok: false, 
        error: { code: 'INTERNAL_ERROR', message: 'Registration failed' } 
      });
    }
  }
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        ok: false, 
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: errors.array() } 
      });
    }
    
    const { email, password } = req.body;
    
    try {
      const user = await models.User.findOne({ 
        where: { email },
        include: [{ model: models.Role, as: 'role' }]
      });
      
      if (!user) {
        return res.status(401).json({ 
          ok: false, 
          error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } 
        });
      }
      
      const valid = await user.validPassword(password);
      if (!valid) {
        return res.status(401).json({ 
          ok: false, 
          error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } 
        });
      }
      
      const roleName = user.role ? user.role.name : 'USER';
      const payload = { id: user.id, role: roleName };
      
      const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { 
        expiresIn: process.env.JWT_EXPIRY || '15m' 
      });
      const refreshToken = jwt.sign(payload, process.env.REFRESH_SECRET, { 
        expiresIn: process.env.REFRESH_EXPIRY || '7d' 
      });
      
      refreshTokens.set(refreshToken, user.id);
      
      return res.json({ 
        ok: true, 
        data: { 
          accessToken, 
          refreshToken,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: roleName,
            avatarUrl: user.avatarUrl,
            isVerified: user.isVerified
          }
        } 
      });
    } catch (err) {
      console.error('Login error:', err);
      return res.status(500).json({ 
        ok: false, 
        error: { code: 'INTERNAL_ERROR', message: 'Login failed' } 
      });
    }
  }
);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: New access token
 */
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(400).json({ 
      ok: false, 
      error: { code: 'MISSING_TOKEN', message: 'Refresh token is required' } 
    });
  }
  
  if (!refreshTokens.has(refreshToken)) {
    return res.status(401).json({ 
      ok: false, 
      error: { code: 'INVALID_TOKEN', message: 'Invalid or expired refresh token' } 
    });
  }
  
  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
    const payload = { id: decoded.id, role: decoded.role };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { 
      expiresIn: process.env.JWT_EXPIRY || '15m' 
    });
    
    return res.json({ ok: true, data: { accessToken } });
  } catch (err) {
    refreshTokens.delete(refreshToken);
    return res.status(401).json({ 
      ok: false, 
      error: { code: 'INVALID_TOKEN', message: 'Invalid or expired refresh token' } 
    });
  }
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user (revoke refresh token)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout', (req, res) => {
  const { refreshToken } = req.body;
  if (refreshTokens.has(refreshToken)) {
    refreshTokens.delete(refreshToken);
  }
  res.json({ ok: true, data: { message: 'Logged out successfully' } });
});

module.exports = router;