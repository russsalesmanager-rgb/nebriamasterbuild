const { Model, DataTypes } = require('sequelize');

class Notification extends Model {
  static initModel(sequelize) {
    Notification.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true
        },
        userId: {
          type: DataTypes.UUID,
          allowNull: false
        },
        type: {
          type: DataTypes.ENUM('LIKE', 'REPLY', 'FOLLOW', 'MENTION', 'MESSAGE'),
          allowNull: false
        },
        actorId: {
          type: DataTypes.UUID,
          allowNull: true
        },
        targetId: {
          type: DataTypes.UUID,
          allowNull: true
        },
        message: {
          type: DataTypes.STRING,
          allowNull: false
        },
        read: {
          type: DataTypes.BOOLEAN,
          defaultValue: false
        }
      },
      {
        sequelize,
        tableName: 'notifications',
        modelName: 'Notification'
      }
    );
    return Notification;
  }
  static associate(models) {
    Notification.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    Notification.belongsTo(models.User, { foreignKey: 'actorId', as: 'actor' });
  }
}

module.exports = Notification;