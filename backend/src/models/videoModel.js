const { Model, DataTypes } = require('sequelize');

class Video extends Model {
  static initModel(sequelize) {
    Video.init(
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
        },
        fileId: {
          type: DataTypes.UUID,
          allowNull: false
        },
        thumbnailUrl: {
          type: DataTypes.STRING
        },
        duration: {
          type: DataTypes.INTEGER
        },
        transcoded: {
          type: DataTypes.BOOLEAN,
          defaultValue: false
        }
      },
      {
        sequelize,
        tableName: 'videos',
        modelName: 'Video'
      }
    );
    return Video;
  }

  static associate(models) {
    Video.belongsTo(models.User, { foreignKey: 'userId', as: 'author' });
    Video.belongsTo(models.File, { foreignKey: 'fileId', as: 'file' });
  }
}

module.exports = Video;