/*
 * Sequelize model index
 *
 * This module initialises all defined models and their associations.
 * When adding a new model you should import it here and call its
 * init() and associate() static methods.  The models are then
 * exported on a single object for convenient access.
 */

const sequelize = require('../config/db');

const User = require('./userModel');
const Role = require('./roleModel');
const Post = require('./postModel');
const Comment = require('./commentModel');
const Reaction = require('./reactionModel');
const File = require('./fileModel');
const Video = require('./videoModel');
const Board = require('./boardModel');
const BoardItem = require('./boardItemModel');
const Token = require('./tokenModel');
const Wallet = require('./walletModel');
const Transaction = require('./transactionModel');
const Message = require('./messageModel');
const Chat = require('./chatModel');
const ChatParticipant = require('./chatParticipantModel');
const Notification = require('./notificationModel');
const AuditLog = require('./auditLogModel');

// Initialise all models
const models = {
  User: User.initModel(sequelize),
  Role: Role.initModel(sequelize),
  Post: Post.initModel(sequelize),
  Comment: Comment.initModel(sequelize),
  Reaction: Reaction.initModel(sequelize),
  File: File.initModel(sequelize),
  Video: Video.initModel(sequelize),
  Board: Board.initModel(sequelize),
  BoardItem: BoardItem.initModel(sequelize),
  Token: Token.initModel(sequelize),
  Wallet: Wallet.initModel(sequelize),
  Transaction: Transaction.initModel(sequelize),
  Message: Message.initModel(sequelize),
  Chat: Chat.initModel(sequelize),
  ChatParticipant: ChatParticipant.initModel(sequelize),
  Notification: Notification.initModel(sequelize),
  AuditLog: AuditLog.initModel(sequelize)
};

// Define associations between models
Object.values(models).forEach((model) => {
  if (typeof model.associate === 'function') {
    model.associate(models);
  }
});

module.exports = models;