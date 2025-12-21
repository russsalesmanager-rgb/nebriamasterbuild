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
          field: 'zone_key',
          comment: 'Zone identifier: home, you, pin, pix, thread, x, vr, ai'
        },
        zoneType: {
          type: DataTypes.STRING(50),
          allowNull: true,
          field: 'zone_type',
          comment: 'Additional zone classification'
        },
        isIllegal: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
          field: 'is_illegal',
          comment: 'Flagged as illegal content'
        },
        isBanned: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
          field: 'is_banned',
          comment: 'Content is banned'
        },
        bannedBy: {
          type: DataTypes.UUID,
          allowNull: true,
          field: 'banned_by',
          comment: 'User ID who banned this content'
        },
        bannedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          field: 'banned_at'
        }
      },
      {
        sequelize,
        tableName: 'posts',
        modelName: 'Post'
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