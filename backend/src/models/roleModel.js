const { Model, DataTypes } = require('sequelize');

class Role extends Model {
  static initModel(sequelize) {
    Role.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        name: {
          type: DataTypes.STRING(50),
          allowNull: false,
          unique: true
        },
        description: {
          type: DataTypes.TEXT
        }
      },
      {
        sequelize,
        tableName: 'roles',
        modelName: 'Role',
        timestamps: false
      }
    );
    return Role;
  }
  static associate(models) {
    // Roles have many users
    Role.hasMany(models.User, { foreignKey: 'roleId', as: 'users' });
  }
}

module.exports = Role;