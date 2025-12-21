const express = require('express');
const { body, validationResult } = require('express-validator');
const { authMiddleware } = require('../middleware/auth');
const models = require('../models');

const router = express.Router();

// Create or find a chat between two users
async function getDirectChat(userId1, userId2) {
  // A direct chat is a Chat with exactly two participants and isGroup=false
  const chats = await models.Chat.findAll({
    where: { isGroup: false },
    include: [
      { model: models.ChatParticipant, as: 'participants', where: { userId: userId1 } },
      { model: models.ChatParticipant, as: 'participants', where: { userId: userId2 } }
    ]
  });
  return chats[0];
}

// List user chats
router.get('/chats', authMiddleware, async (req, res) => {
  try {
    const chats = await models.Chat.findAll({
      include: [
        {
          model: models.ChatParticipant,
          as: 'participants',
          where: { userId: req.user.id }
        },
        { model: models.Message, as: 'messages', limit: 1, order: [['createdAt', 'DESC']] }
      ]
    });
    return res.json(chats);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch chats' });
  }
});

// Send message to chat (direct or group)
router.post(
  '/chats/:chatId/messages',
  authMiddleware,
  [body('content').isLength({ min: 1 })],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { content } = req.body;
    const chatId = req.params.chatId;
    try {
      // Ensure user is a participant
      const isParticipant = await models.ChatParticipant.findOne({ where: { chatId, userId: req.user.id } });
      if (!isParticipant) {
        return res.status(403).json({ error: 'Not a participant of this chat' });
      }
      const message = await models.Message.create({ chatId, userId: req.user.id, content });
      // Emit via WebSocket
      const io = req.app.get('io');
      io.to(chatId).emit('newMessage', message);
      return res.status(201).json(message);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to send message' });
    }
  }
);

// Create direct chat
router.post('/direct', authMiddleware, [body('otherUserId').isUUID()], async (req, res) => {
  const { otherUserId } = req.body;
  if (otherUserId === req.user.id) {
    return res.status(400).json({ error: 'Cannot chat with yourself' });
  }
  try {
    let chat = await getDirectChat(req.user.id, otherUserId);
    if (!chat) {
      chat = await models.Chat.create({ isGroup: false });
      await models.ChatParticipant.bulkCreate([
        { chatId: chat.id, userId: req.user.id },
        { chatId: chat.id, userId: otherUserId }
      ]);
    }
    return res.status(201).json(chat);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to create chat' });
  }
});

module.exports = router;