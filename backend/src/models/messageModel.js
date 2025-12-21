const { Model, DataTypes } = require('sequelize');

class Message extends Model {
  static initModel(sequelize) {
    Message.init(
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
        content: {
          type: DataTypes.TEXT,
          allowNull: false
        }
      },
      {
        sequelize,
        tableName: 'messages',
        modelName: 'Message'
      }
    );
    return Message;
  }
  static associate(models) {
    Message.belongsTo(models.Chat, { foreignKey: 'chatId', as: 'chat' });
    Message.belongsTo(models.User, { foreignKey: 'userId', as: 'sender' });
  }
}

module.exports = Message;