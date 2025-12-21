const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

class User extends Model {
  static initModel(sequelize) {
    User.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true
        },
        username: {
          type: DataTypes.STRING(50),
          allowNull: false,
          unique: true
        },
        email: {
          type: DataTypes.STRING(100),
          allowNull: false,
          unique: true,
          validate: {
            isEmail: true
          }
        },
        passwordHash: {
          type: DataTypes.STRING,
          allowNull: false
        },
        roleId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 5 // 5 corresponds to USER role by default
        },
        avatarUrl: {
          type: DataTypes.STRING
        },
        bio: {
          type: DataTypes.TEXT
        },
        isVerified: {
          type: DataTypes.BOOLEAN,
          defaultValue: false
        },
        isBanned: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
          field: 'is_banned'
        },
        bannedAt: {
          type: DataTypes.DATE,
          allowNull: true,
          field: 'banned_at'
        }
      },
      {
        sequelize,
        tableName: 'users',
        modelName: 'User'
      }
    );

    // Password hashing hook
    User.beforeCreate(async (user) => {
      if (user.passwordHash) {
        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(user.passwordHash, salt);
      }
    });

    return User;
  }

  static associate(models) {
    User.belongsTo(models.Role, { foreignKey: 'roleId', as: 'role' });
    User.hasMany(models.Post, { foreignKey: 'userId', as: 'posts' });
    User.hasMany(models.Comment, { foreignKey: 'userId', as: 'comments' });
    User.hasMany(models.Reaction, { foreignKey: 'userId', as: 'reactions' });
    User.hasMany(models.File, { foreignKey: 'userId', as: 'files' });
    User.hasMany(models.Video, { foreignKey: 'userId', as: 'videos' });
    User.hasMany(models.Board, { foreignKey: 'userId', as: 'boards' });
    User.hasOne(models.Wallet, { foreignKey: 'userId', as: 'wallet' });
    User.hasMany(models.Transaction, { foreignKey: 'fromUserId', as: 'sentTransactions' });
    User.hasMany(models.Transaction, { foreignKey: 'toUserId', as: 'receivedTransactions' });
    User.hasMany(models.Message, { foreignKey: 'userId', as: 'messages' });
    User.hasMany(models.Notification, { foreignKey: 'userId', as: 'notifications' });
    User.hasMany(models.AuditLog, { foreignKey: 'actorUserId', as: 'auditLogs' });
  }

  // Instance method to verify password
  async validPassword(password) {
    return bcrypt.compare(password, this.passwordHash);
  }
}

module.exports = User;