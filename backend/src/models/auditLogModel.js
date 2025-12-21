const { Model, DataTypes } = require('sequelize');

class AuditLog extends Model {
  static initModel(sequelize) {
    AuditLog.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true
        },
        actorUserId: {
          type: DataTypes.UUID,
          allowNull: true
        },
        action: {
          type: DataTypes.STRING,
          allowNull: false
        },
        targetId: {
          type: DataTypes.STRING,
          allowNull: true
        },
        details: {
          type: DataTypes.JSON
        }
      },
      {
        sequelize,
        tableName: 'audit_logs',
        modelName: 'AuditLog'
      }
    );
    return AuditLog;
  }
  static associate(models) {
    AuditLog.belongsTo(models.User, { foreignKey: 'actorUserId', as: 'actor' });
  }
}

module.exports = AuditLog;