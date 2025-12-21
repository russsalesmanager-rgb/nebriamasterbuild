const express = require('express');
const { body, validationResult } = require('express-validator');
const { authMiddleware, requireRole } = require('../middleware/auth');
const models = require('../models');

const router = express.Router();

// List all users (admin/owner only)
router.get('/users', authMiddleware, requireRole(['ADMIN']), async (req, res) => {
  try {
    const users = await models.User.findAll({
      attributes: ['id', 'username', 'email', 'isVerified', 'roleId'],
      include: [{ model: models.Role, as: 'role', attributes: ['name'] }]
    });
    return res.json(users);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Change user role
router.post(
  '/users/:id/role',
  authMiddleware,
  requireRole(['OWNER', 'ADMIN']),
  [body('roleName').isIn(['OWNER', 'ADMIN', 'MODERATOR', 'VERIFIED_CREATOR', 'USER'])],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { roleName } = req.body;
    try {
      const user = await models.User.findByPk(req.params.id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      const role = await models.Role.findOne({ where: { name: roleName } });
      if (!role) return res.status(400).json({ error: 'Role not found' });
      user.roleId = role.id;
      await user.save();
      return res.json({ message: 'Role updated' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to update role' });
    }
  }
);

// Delete any post
router.delete('/posts/:id', authMiddleware, requireRole(['ADMIN', 'MODERATOR']), async (req, res) => {
  try {
    const post = await models.Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ error: 'Not found' });
    await post.destroy();
    return res.json({ message: 'Post deleted by admin' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to delete post' });
  }
});

// Suspend or ban user
router.post('/users/:id/ban', authMiddleware, requireRole(['ADMIN', 'OWNER']), async (req, res) => {
  try {
    const user = await models.User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    // For demonstration we'll simply set role to null to indicate ban
    user.roleId = null;
    await user.save();
    return res.json({ message: 'User banned' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to ban user' });
  }
});

// Review flagged content (placeholder)
router.get('/flags', authMiddleware, requireRole(['MODERATOR', 'ADMIN']), async (req, res) => {
  // In a real implementation this would query flagged posts/comments
  return res.json([]);
});

module.exports = router;