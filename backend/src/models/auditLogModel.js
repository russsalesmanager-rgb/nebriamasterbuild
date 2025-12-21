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
          allowNull: true,
          field: 'actor_user_id'
        },
        userId: {
          type: DataTypes.UUID,
          allowNull: true,
          field: 'user_id'
        },
        action: {
          type: DataTypes.STRING,
          allowNull: false
        },
        entityType: {
          type: DataTypes.STRING,
          allowNull: true,
          field: 'entity_type'
        },
        entityId: {
          type: DataTypes.STRING,
          allowNull: true,
          field: 'entity_id'
        },
        targetId: {
          type: DataTypes.STRING,
          allowNull: true,
          field: 'target_id'
        },
        metadata: {
          type: DataTypes.JSON
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