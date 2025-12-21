const { Model, DataTypes } = require('sequelize');

class Reaction extends Model {
  static initModel(sequelize) {
    Reaction.init(
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
        type: {
          type: DataTypes.ENUM('LIKE', 'LOVE', 'WOW', 'HAHA', 'SAD', 'ANGRY'),
          allowNull: false,
          defaultValue: 'LIKE'
        }
      },
      {
        sequelize,
        tableName: 'reactions',
        modelName: 'Reaction'
      }
    );
    return Reaction;
  }

  static associate(models) {
    Reaction.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    Reaction.belongsTo(models.Post, { foreignKey: 'postId', as: 'post' });
  }
}

module.exports = Reaction;