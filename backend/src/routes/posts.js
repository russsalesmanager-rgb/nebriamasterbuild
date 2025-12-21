const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { authMiddleware, requireRole } = require('../middleware/auth');
const models = require('../models');

const router = express.Router();

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Get posts feed (strict reverse chronological)
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: zone_key
 *         schema:
 *           type: string
 *         description: Filter by zone (e.g., 'you-zone', 'pix-zone', 'thread-zone')
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of posts to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Pagination offset
 *     responses:
 *       200:
 *         description: List of posts in reverse chronological order
 */
router.get('/', [
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      ok: false, 
      error: { code: 'VALIDATION_ERROR', message: 'Invalid parameters', details: errors.array() } 
    });
  }

  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const zoneKey = req.query.zone_key;

    const whereClause = {};
    if (zoneKey) {
      whereClause.zoneKey = zoneKey;
    }

    const posts = await models.Post.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']], // STRICT reverse chronological
      limit,
      offset,
      include: [
        { model: models.User, as: 'author', attributes: ['id', 'username', 'avatarUrl', 'isVerified'] },
        { model: models.Comment, as: 'comments', limit: 5 },
        { model: models.Reaction, as: 'reactions' }
      ]
    });

    return res.json({
      ok: true,
      data: posts,
      meta: {
        limit,
        offset,
        count: posts.length,
        zoneKey: zoneKey || 'all'
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ 
      ok: false, 
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch posts' } 
    });
  }
});

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [TEXT, IMAGE, VIDEO, LINK, MULTIMEDIA]
 *               mediaId:
 *                 type: string
 *               parentId:
 *                 type: string
 *               zoneKey:
 *                 type: string
 *     responses:
 *       201:
 *         description: Post created successfully
 */
router.post(
  '/',
  authMiddleware,
  [
    body('content').optional().isLength({ max: 5000 }),
    body('type').optional().isIn(['TEXT', 'IMAGE', 'VIDEO', 'LINK', 'MULTIMEDIA']),
    body('zoneKey').optional().isString()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        ok: false, 
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: errors.array() } 
      });
    }
    
    const { content, type = 'TEXT', mediaId, parentId, zoneKey } = req.body;
    
    try {
      const post = await models.Post.create({
        userId: req.user.id,
        content,
        type,
        mediaId,
        parentId,
        zoneKey
      });
      
      const newPost = await models.Post.findByPk(post.id, {
        include: [{ model: models.User, as: 'author', attributes: ['id', 'username', 'avatarUrl', 'isVerified'] }]
      });
      
      // TODO: Emit WebSocket event for real-time updates
      const io = req.app.get('io');
      if (io && zoneKey) {
        io.to(`zone:${zoneKey}`).emit('newPost', newPost);
      }
      
      return res.status(201).json({ ok: true, data: newPost });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ 
        ok: false, 
        error: { code: 'INTERNAL_ERROR', message: 'Failed to create post' } 
      });
    }
  }
);

/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     summary: Get a specific post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post details
 */
router.get('/:id', async (req, res) => {
  try {
    const post = await models.Post.findByPk(req.params.id, {
      include: [
        { model: models.User, as: 'author', attributes: ['id', 'username', 'avatarUrl', 'isVerified'] },
        { 
          model: models.Comment, 
          as: 'comments', 
          include: [{ model: models.User, as: 'author', attributes: ['id', 'username', 'avatarUrl'] }],
          order: [['createdAt', 'ASC']]
        },
        { model: models.Reaction, as: 'reactions' }
      ]
    });
    
    if (!post) {
      return res.status(404).json({ 
        ok: false, 
        error: { code: 'NOT_FOUND', message: 'Post not found' } 
      });
    }
    
    return res.json({ ok: true, data: post });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ 
      ok: false, 
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch post' } 
    });
  }
});

/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Delete a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post deleted successfully
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const post = await models.Post.findByPk(req.params.id);
    
    if (!post) {
      return res.status(404).json({ 
        ok: false, 
        error: { code: 'NOT_FOUND', message: 'Post not found' } 
      });
    }
    
    // Get user role
    const user = await models.User.findByPk(req.user.id, {
      include: [{ model: models.Role, as: 'role' }]
    });
    
    // Check permissions: author, moderator, admin, or owner
    const isOwner = user.role && user.role.name === 'OWNER';
    const isAdmin = user.role && ['ADMIN', 'MODERATOR'].includes(user.role.name);
    const isAuthor = post.userId === req.user.id;
    
    if (!isOwner && !isAdmin && !isAuthor) {
      return res.status(403).json({ 
        ok: false, 
        error: { code: 'FORBIDDEN', message: 'You do not have permission to delete this post' } 
      });
    }
    
    // Log moderation action if deleted by admin/moderator
    if ((isAdmin || isOwner) && !isAuthor) {
      await models.AuditLog.create({
        actorUserId: req.user.id,
        action: 'DELETE_POST',
        targetId: post.id,
        details: { 
          reason: 'Admin/Moderator deletion',
          postContent: post.content,
          postAuthor: post.userId
        }
      });
    }
    
    await post.destroy();
    
    return res.json({ 
      ok: true, 
      data: { message: 'Post deleted successfully' } 
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ 
      ok: false, 
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete post' } 
    });
  }
});

module.exports = router;