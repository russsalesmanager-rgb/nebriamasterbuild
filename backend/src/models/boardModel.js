const { Model, DataTypes } = require('sequelize');

class Board extends Model {
  static initModel(sequelize) {
    Board.init(
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
        title: {
          type: DataTypes.STRING(255),
          allowNull: false
        },
        description: {
          type: DataTypes.TEXT
        }
      },
      {
        sequelize,
        tableName: 'boards',
        modelName: 'Board'
      }
    );
    return Board;
  }
  static associate(models) {
    Board.belongsTo(models.User, { foreignKey: 'userId', as: 'owner' });
    Board.hasMany(models.BoardItem, { foreignKey: 'boardId', as: 'items' });
  }
}

module.exports = Board;