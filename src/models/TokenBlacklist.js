/**
 * Modelo TokenBlacklist
 * Almacena tokens invalidados (logout, password change, etc.)
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const TokenBlacklist = sequelize.define('TokenBlacklist', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        // JWT ID único del token invalidado
        token_jti: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        // Cuándo expira el token original (para limpieza automática)
        expires_at: {
            type: DataTypes.DATE,
            allowNull: false
        },
        reason: {
            type: DataTypes.ENUM('LOGOUT', 'PASSWORD_CHANGE', 'SECURITY_BREACH', 'ADMIN_REVOKE'),
            allowNull: false
        }
    }, {
        tableName: 'token_blacklist',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false,
        indexes: [
            {
                unique: true,
                fields: ['token_jti']
            },
            {
                fields: ['user_id']
            },
            {
                fields: ['expires_at']
            }
        ]
    });

    /**
     * Verificar si un JTI está en blacklist
     */
    TokenBlacklist.isBlacklisted = async function (jti) {
        const entry = await this.findOne({
            where: { token_jti: jti }
        });
        return !!entry;
    };

    /**
     * Limpiar tokens expirados de la blacklist
     * Debería ejecutarse periódicamente como cron job
     */
    TokenBlacklist.cleanup = async function () {
        const { Op } = require('sequelize');
        const deleted = await this.destroy({
            where: {
                expires_at: { [Op.lt]: new Date() }
            }
        });
        return deleted;
    };

    TokenBlacklist.associate = (models) => {
        TokenBlacklist.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'user'
        });
    };

    return TokenBlacklist;
};
