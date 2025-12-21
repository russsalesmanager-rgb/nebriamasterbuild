const express = require('express');
const { body, validationResult } = require('express-validator');
const { authMiddleware, requireRole } = require('../middleware/auth');
const models = require('../models');

const router = express.Router();

// Get user profile
router.get('/:id', async (req, res) => {
  try {
    const user = await models.User.findByPk(req.params.id, {
      attributes: ['id', 'username', 'email', 'bio', 'avatarUrl', 'isVerified'],
      include: [{ model: models.Role, as: 'role', attributes: ['name'] }]
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user profile (must be self)
router.put(
  '/:id',
  authMiddleware,
  [
    body('bio').optional().isLength({ max: 500 }),
    body('avatarUrl').optional().isURL()
  ],
  async (req, res) => {
    const userId = req.params.id;
    if (req.user.id !== userId && req.user.role !== 'OWNER' && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { bio, avatarUrl } = req.body;
    try {
      const user = await models.User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      if (bio !== undefined) user.bio = bio;
      if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
      await user.save();
      return res.json({ message: 'Profile updated', user: { id: user.id, bio: user.bio, avatarUrl: user.avatarUrl } });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to update user' });
    }
  }
);

// List user's posts
router.get('/:id/posts', async (req, res) => {
  try {
    const posts = await models.Post.findAll({
      where: { userId: req.params.id },
      order: [['createdAt', 'DESC']],
      include: [
        { model: models.User, as: 'author', attributes: ['id', 'username'] },
        { model: models.Comment, as: 'comments' },
        { model: models.Reaction, as: 'reactions' }
      ]
    });
    return res.json(posts);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

module.exports = router;