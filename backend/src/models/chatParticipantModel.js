const { Model, DataTypes } = require('sequelize');

class ChatParticipant extends Model {
  static initModel(sequelize) {
    ChatParticipant.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true
        },
        chatId: {
          type: DataTypes.UUID,
          allowNull: false
        },
        userId: {
          type: DataTypes.UUID,
          allowNull: false
        },
        role: {
          type: DataTypes.ENUM('ADMIN', 'MEMBER'),
          defaultValue: 'MEMBER'
        }
      },
      {
        sequelize,
        tableName: 'chat_participants',
        modelName: 'ChatParticipant'
      }
    );
    return ChatParticipant;
  }
  static associate(models) {
    ChatParticipant.belongsTo(models.Chat, { foreignKey: 'chatId', as: 'chat' });
    ChatParticipant.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  }
}

module.exports = ChatParticipant;