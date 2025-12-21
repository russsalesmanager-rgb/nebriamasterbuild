const express = require('express');
const { body, validationResult } = require('express-validator');
const { authMiddleware, requireRole } = require('../middleware/auth');
const models = require('../models');
const { ZONE_KEYS } = require('../config/zones');

const router = express.Router();

// Get global feed (reverse chronological)
router.get('/', async (req, res) => {
  try {
    const { zone_key, limit = 50, offset = 0 } = req.query;
    
    const where = {};
    if (zone_key) {
      where.zoneKey = zone_key;
    }
    
    // Filter out banned content unless user is admin/owner
    where.isBanned = false;
    
    const posts = await models.Post.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        { model: models.User, as: 'author', attributes: ['id', 'username'] },
        { model: models.Comment, as: 'comments' },
        { model: models.Reaction, as: 'reactions' }
      ]
    });
    return res.json({ ok: true, data: posts, meta: { count: posts.length, offset: parseInt(offset), limit: parseInt(limit) } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: { code: 'FETCH_FAILED', message: 'Failed to fetch posts', details: err.message } });
  }
});

// Create a new post
router.post(
  '/',
  authMiddleware,
  [
    body('content').optional().isLength({ max: 5000 }),
    body('zoneKey').optional().isIn(ZONE_KEYS)
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ ok: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: errors.array() } });
    }
    const { content, type = 'TEXT', mediaId, parentId, zoneKey = 'home', zoneType } = req.body;
    try {
      const post = await models.Post.create({
        userId: req.user.id,
        content,
        type,
        mediaId,
        parentId,
        zoneKey,
        zoneType
      });
      const newPost = await models.Post.findByPk(post.id, {
        include: [{ model: models.User, as: 'author', attributes: ['id', 'username'] }]
      });
      return res.status(201).json({ ok: true, data: newPost });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ ok: false, error: { code: 'CREATE_FAILED', message: 'Failed to create post', details: err.message } });
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
    if (!post) return res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'Post not found' } });
    
    // Only author or admin/owner can delete
    if (post.userId !== req.user.id && !['ADMIN', 'OWNER', 'MODERATOR'].includes(req.user.role)) {
      return res.status(403).json({ ok: false, error: { code: 'FORBIDDEN', message: 'You do not have permission to delete this post' } });
    }
    
    // Log if owner overrides
    if (req.user.role === 'OWNER' && post.userId !== req.user.id) {
      await models.AuditLog.create({
        userId: req.user.id,
        action: 'DELETE_POST_OVERRIDE',
        entityType: 'Post',
        entityId: post.id,
        metadata: { originalAuthor: post.userId, reason: req.body.reason || 'Owner override' }
      });
    }
    
    await post.destroy();
    return res.json({ ok: true, data: { message: 'Post deleted' } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: { code: 'DELETE_FAILED', message: 'Failed to delete post', details: err.message } });
  }
});

// Flag post as illegal (instant delete + permanent ban)
router.post('/:id/flag-illegal', authMiddleware, requireRole(['MODERATOR', 'ADMIN', 'OWNER']), async (req, res) => {
  try {
    const post = await models.Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'Post not found' } });
    
    // Mark as illegal and banned
    post.isIllegal = true;
    post.isBanned = true;
    post.bannedBy = req.user.id;
    post.bannedAt = new Date();
    await post.save();
    
    // Ban the user who posted it
    const user = await models.User.findByPk(post.userId);
    if (user) {
      user.isBanned = true;
      user.bannedAt = new Date();
      await user.save();
    }
    
    // Audit log
    await models.AuditLog.create({
      userId: req.user.id,
      action: 'FLAG_ILLEGAL_CONTENT',
      entityType: 'Post',
      entityId: post.id,
      metadata: { bannedUser: post.userId, reason: req.body.reason || 'Illegal content' }
    });
    
    return res.json({ ok: true, data: { message: 'Content flagged as illegal and user banned', postId: post.id, userId: post.userId } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: { code: 'FLAG_FAILED', message: 'Failed to flag content', details: err.message } });
  }
});

// Owner override - unban content
router.post('/:id/unban', authMiddleware, requireRole(['OWNER']), async (req, res) => {
  try {
    const post = await models.Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ ok: false, error: { code: 'NOT_FOUND', message: 'Post not found' } });
    
    post.isBanned = false;
    post.isIllegal = false;
    await post.save();
    
    // Audit log for owner override
    await models.AuditLog.create({
      userId: req.user.id,
      action: 'OWNER_UNBAN_POST',
      entityType: 'Post',
      entityId: post.id,
      metadata: { reason: req.body.reason || 'Owner override' }
    });
    
    return res.json({ ok: true, data: { message: 'Post unbanned', postId: post.id } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: { code: 'UNBAN_FAILED', message: 'Failed to unban post', details: err.message } });
  }
});

module.exports = router;