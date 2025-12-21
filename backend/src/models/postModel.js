const { Model, DataTypes } = require('sequelize');

class Post extends Model {
  static initModel(sequelize) {
    Post.init(
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
        content: {
          type: DataTypes.TEXT,
          allowNull: true
        },
        type: {
          type: DataTypes.ENUM('TEXT', 'IMAGE', 'VIDEO', 'LINK', 'MULTIMEDIA'),
          allowNull: false,
          defaultValue: 'TEXT'
        },
        mediaId: {
          type: DataTypes.UUID,
          allowNull: true
        },
        parentId: {
          type: DataTypes.UUID,
          allowNull: true
        },
        zoneKey: {
          type: DataTypes.STRING(50),
          allowNull: true,
          comment: 'Zone identifier (e.g., you-zone, pix-zone, thread-zone)'
        }
      },
      {
        sequelize,
        tableName: 'posts',
        modelName: 'Post',
        indexes: [
          {
            fields: ['createdAt']
          },
          {
            fields: ['userId']
          },
          {
            fields: ['zoneKey']
          },
          {
            fields: ['parentId']
          }
        ]
      }
    );
    return Post;
  }

  static associate(models) {
    Post.belongsTo(models.User, { foreignKey: 'userId', as: 'author' });
    Post.belongsTo(models.Post, { foreignKey: 'parentId', as: 'parent' });
    Post.hasMany(models.Post, { foreignKey: 'parentId', as: 'replies' });
    Post.hasMany(models.Comment, { foreignKey: 'postId', as: 'comments' });
    Post.hasMany(models.Reaction, { foreignKey: 'postId', as: 'reactions' });
    Post.hasMany(models.BoardItem, { foreignKey: 'postId', as: 'boardItems' });
  }
}

module.exports = Post;