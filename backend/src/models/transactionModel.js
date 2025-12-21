const { Model, DataTypes } = require('sequelize');

class Transaction extends Model {
  static initModel(sequelize) {
    Transaction.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true
        },
        fromUserId: {
          type: DataTypes.UUID,
          allowNull: true
        },
        toUserId: {
          type: DataTypes.UUID,
          allowNull: true
        },
        amount: {
          type: DataTypes.BIGINT,
          allowNull: false
        },
        type: {
          type: DataTypes.ENUM('TIP', 'EARN', 'PURCHASE', 'BOOST', 'FEE'),
          allowNull: false
        },
        description: {
          type: DataTypes.STRING
        }
      },
      {
        sequelize,
        tableName: 'transactions',
        modelName: 'Transaction'
      }
    );
    return Transaction;
  }
  static associate(models) {
    Transaction.belongsTo(models.User, { foreignKey: 'fromUserId', as: 'fromUser' });
    Transaction.belongsTo(models.User, { foreignKey: 'toUserId', as: 'toUser' });
  }
}

module.exports = Transaction;