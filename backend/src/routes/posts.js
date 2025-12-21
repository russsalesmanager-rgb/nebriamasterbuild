const express = require('express');
const { body, validationResult } = require('express-validator');
const { authMiddleware, requireRole } = require('../middleware/auth');
const models = require('../models');

const router = express.Router();

// Get global feed (reverse chronological)
router.get('/', async (req, res) => {
  try {
    const posts = await models.Post.findAll({
      order: [['createdAt', 'DESC']],
      limit: 50,
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

// Create a new post
router.post(
  '/',
  authMiddleware,
  [body('content').optional().isLength({ max: 500 })],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { content, type = 'TEXT', mediaId, parentId } = req.body;
    try {
      const post = await models.Post.create({
        userId: req.user.id,
        content,
        type,
        mediaId,
        parentId
      });
      const newPost = await models.Post.findByPk(post.id, {
        include: [{ model: models.User, as: 'author', attributes: ['id', 'username'] }]
      });
      return res.status(201).json(newPost);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to create post' });
    }
  }
);

// Get a specific post
router.get('/:id', async (req, res) => {
  try {
    const post = await models.Post.findByPk(req.params.id, {
      include: [
        { model: models.User, as: 'author', attributes: ['id', 'username'] },
        { model: models.Comment, as: 'comments', include: [{ model: models.User, as: 'author', attributes: ['id', 'username'] }] },
        { model: models.Reaction, as: 'reactions' }
      ]
    });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    return res.json(post);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// Delete a post (only author or roles)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const post = await models.Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ error: 'Not found' });
    // Only author or admin/owner can delete
    if (post.userId !== req.user.id && !['ADMIN', 'OWNER', 'MODERATOR'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await post.destroy();
    return res.json({ message: 'Post deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to delete post' });
  }
});

module.exports = router;