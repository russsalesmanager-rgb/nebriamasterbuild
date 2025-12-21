const express = require('express');
const { body, validationResult } = require('express-validator');
const { authMiddleware } = require('../middleware/auth');
const models = require('../models');

const router = express.Router();

// Get comments for a post
router.get('/post/:postId', async (req, res) => {
  try {
    const comments = await models.Comment.findAll({
      where: { postId: req.params.postId, parentId: null },
      order: [['createdAt', 'ASC']],
      include: [
        { model: models.User, as: 'author', attributes: ['id', 'username'] },
        { model: models.Comment, as: 'replies', include: [{ model: models.User, as: 'author', attributes: ['id', 'username'] }] }
      ]
    });
    return res.json(comments);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Create a new comment
router.post(
  '/post/:postId',
  authMiddleware,
  [body('content').isLength({ min: 1 })],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { content, parentId } = req.body;
    try {
      const comment = await models.Comment.create({
        postId: req.params.postId,
        userId: req.user.id,
        content,
        parentId: parentId || null
      });
      const newComment = await models.Comment.findByPk(comment.id, {
        include: [{ model: models.User, as: 'author', attributes: ['id', 'username'] }]
      });
      return res.status(201).json(newComment);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to create comment' });
    }
  }
);

// Delete a comment
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const comment = await models.Comment.findByPk(req.params.id);
    if (!comment) return res.status(404).json({ error: 'Not found' });
    if (comment.userId !== req.user.id && !['ADMIN', 'OWNER', 'MODERATOR'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await comment.destroy();
    return res.json({ message: 'Comment deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to delete comment' });
  }
});

module.exports = router;