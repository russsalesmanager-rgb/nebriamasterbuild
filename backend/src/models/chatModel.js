const { Model, DataTypes } = require('sequelize');

class Chat extends Model {
  static initModel(sequelize) {
    Chat.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true
        },
        isGroup: {
          type: DataTypes.BOOLEAN,
          defaultValue: false
        },
        groupName: {
          type: DataTypes.STRING(255)
        }
      },
      {
        sequelize,
        tableName: 'chats',
        modelName: 'Chat'
      }
    );
    return Chat;
  }
  static associate(models) {
    Chat.hasMany(models.ChatParticipant, { foreignKey: 'chatId', as: 'participants' });
    Chat.hasMany(models.Message, { foreignKey: 'chatId', as: 'messages' });
  }
}

module.exports = Chat;