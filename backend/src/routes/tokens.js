const express = require('express');
const { body, validationResult } = require('express-validator');
const { authMiddleware } = require('../middleware/auth');
const models = require('../models');

const router = express.Router();

// Get wallet balance
router.get('/wallet', authMiddleware, async (req, res) => {
  try {
    let wallet = await models.Wallet.findOne({ where: { userId: req.user.id } });
    if (!wallet) {
      wallet = await models.Wallet.create({ userId: req.user.id, balance: 0 });
    }
    return res.json({ balance: wallet.balance });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch wallet' });
  }
});

// Transfer tokens (tip/boost)
router.post(
  '/transfer',
  authMiddleware,
  [
    body('toUserId').isUUID(),
    body('amount').isInt({ min: 1 }),
    body('type').isIn(['TIP', 'BOOST', 'PURCHASE'])
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { toUserId, amount, type, description } = req.body;
    try {
      // Get sender wallet
      let senderWallet = await models.Wallet.findOne({ where: { userId: req.user.id } });
      if (!senderWallet || senderWallet.balance < amount) {
        return res.status(400).json({ error: 'Insufficient balance' });
      }
      // Get receiver wallet
      let receiverWallet = await models.Wallet.findOne({ where: { userId: toUserId } });
      if (!receiverWallet) {
        receiverWallet = await models.Wallet.create({ userId: toUserId, balance: 0 });
      }
      // Transfer
      senderWallet.balance -= amount;
      receiverWallet.balance += amount;
      await senderWallet.save();
      await receiverWallet.save();
      // Record transaction
      await models.Transaction.create({
        fromUserId: req.user.id,
        toUserId,
        amount,
        type,
        description
      });
      return res.json({ message: 'Transfer successful' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Transfer failed' });
    }
  }
);

// Get transaction history
router.get('/transactions', authMiddleware, async (req, res) => {
  try {
    const sent = await models.Transaction.findAll({ where: { fromUserId: req.user.id } });
    const received = await models.Transaction.findAll({ where: { toUserId: req.user.id } });
    return res.json({ sent, received });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

module.exports = router;