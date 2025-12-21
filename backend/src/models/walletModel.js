const { Model, DataTypes } = require('sequelize');

class Wallet extends Model {
  static initModel(sequelize) {
    Wallet.init(
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
        balance: {
          type: DataTypes.BIGINT,
          defaultValue: 0
        }
      },
      {
        sequelize,
        tableName: 'wallets',
        modelName: 'Wallet'
      }
    );
    return Wallet;
  }

  static associate(models) {
    Wallet.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  }
}

module.exports = Wallet;