const { Model, DataTypes } = require('sequelize');

class File extends Model {
  static initModel(sequelize) {
    File.init(
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
        originalName: {
          type: DataTypes.STRING,
          allowNull: false
        },
        url: {
          type: DataTypes.STRING,
          allowNull: false
        },
        type: {
          type: DataTypes.ENUM('IMAGE', 'VIDEO', 'DOCUMENT', 'OTHER'),
          allowNull: false,
          defaultValue: 'IMAGE'
        },
        size: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        mimeType: {
          type: DataTypes.STRING,
          allowNull: false
        }
      },
      {
        sequelize,
        tableName: 'files',
        modelName: 'File'
      }
    );
    return File;
  }

  static associate(models) {
    File.belongsTo(models.User, { foreignKey: 'userId', as: 'owner' });
  }
}

module.exports = File;