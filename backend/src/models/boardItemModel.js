const { Model, DataTypes } = require('sequelize');

class BoardItem extends Model {
  static initModel(sequelize) {
    BoardItem.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true
        },
        boardId: {
          type: DataTypes.UUID,
          allowNull: false
        },
        postId: {
          type: DataTypes.UUID,
          allowNull: false
        }
      },
      {
        sequelize,
        tableName: 'board_items',
        modelName: 'BoardItem'
      }
    );
    return BoardItem;
  }
  static associate(models) {
    BoardItem.belongsTo(models.Board, { foreignKey: 'boardId', as: 'board' });
    BoardItem.belongsTo(models.Post, { foreignKey: 'postId', as: 'post' });
  }
}

module.exports = BoardItem;