const { Model, DataTypes } = require('sequelize');

class Comment extends Model {
  static initModel(sequelize) {
    Comment.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true
        },
        postId: {
          type: DataTypes.UUID,
          allowNull: false
        },
        userId: {
          type: DataTypes.UUID,
          allowNull: false
        },
        parentId: {
          type: DataTypes.UUID,
          allowNull: true
        },
        content: {
          type: DataTypes.TEXT,
          allowNull: false
        }
      },
      {
        sequelize,
        tableName: 'comments',
        modelName: 'Comment'
      }
    );
    return Comment;
  }

  static associate(models) {
    Comment.belongsTo(models.User, { foreignKey: 'userId', as: 'author' });
    Comment.belongsTo(models.Post, { foreignKey: 'postId', as: 'post' });
    Comment.belongsTo(models.Comment, { foreignKey: 'parentId', as: 'parent' });
    Comment.hasMany(models.Comment, { foreignKey: 'parentId', as: 'replies' });
  }
}

module.exports = Comment;