const { Model, DataTypes } = require('sequelize');

class Token extends Model {
  static initModel(sequelize) {
    Token.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        name: {
          type: DataTypes.STRING(50),
          allowNull: false
        },
        symbol: {
          type: DataTypes.STRING(10),
          allowNull: false
        },
        decimals: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        totalSupply: {
          type: DataTypes.BIGINT,
          defaultValue: 0
        }
      },
      {
        sequelize,
        tableName: 'tokens',
        modelName: 'Token'
      }
    );
    return Token;
  }
  static associate(models) {
    // Tokens do not have associations yet
  }
}

module.exports = Token;