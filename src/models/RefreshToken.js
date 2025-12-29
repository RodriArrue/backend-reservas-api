/**
 * Modelo RefreshToken
 * Almacena refresh tokens para renovar access tokens
 */

const { DataTypes } = require('sequelize');
const crypto = require('crypto');

module.exports = (sequelize) => {
    const RefreshToken = sequelize.define('RefreshToken', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        token: {
            type: DataTypes.STRING(500),
            allowNull: false,
            unique: true
        },
        // Identificador único del access token asociado (JTI)
        access_token_jti: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        expires_at: {
            type: DataTypes.DATE,
            allowNull: false
        },
        revoked: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        revoked_at: {
            type: DataTypes.DATE,
            allowNull: true
        },
        // Info del cliente para seguridad adicional
        ip_address: {
            type: DataTypes.STRING(45),
            allowNull: true
        },
        user_agent: {
            type: DataTypes.STRING(500),
            allowNull: true
        }
    }, {
        tableName: 'refresh_tokens',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false,
        indexes: [
            {
                fields: ['user_id']
            },
            {
                fields: ['token']
            },
            {
                fields: ['access_token_jti']
            },
            {
                fields: ['expires_at']
            },
            {
                fields: ['revoked']
            }
        ]
    });

    /**
     * Generar un refresh token seguro
     */
    RefreshToken.generateToken = () => {
        return crypto.randomBytes(64).toString('hex');
    };

    RefreshToken.associate = (models) => {
        RefreshToken.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'user'
        });
    };

    return RefreshToken;
};
