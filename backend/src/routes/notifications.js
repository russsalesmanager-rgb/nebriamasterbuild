const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const models = require('../models');

const router = express.Router();

// Get notifications
router.get('/', authMiddleware, async (req, res) => {
  try {
    const notifications = await models.Notification.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 100,
      include: [
        { model: models.User, as: 'actor', attributes: ['id', 'username'] }
      ]
    });
    return res.json(notifications);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
router.post('/:id/read', authMiddleware, async (req, res) => {
  try {
    const notification = await models.Notification.findByPk(req.params.id);
    if (!notification) return res.status(404).json({ error: 'Not found' });
    if (notification.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    notification.read = true;
    await notification.save();
    return res.json({ message: 'Notification marked as read' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to update notification' });
  }
});

module.exports = router;