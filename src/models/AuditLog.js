/**
 * Modelo de Log de Auditoría
 * Registra todas las acciones importantes del sistema
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const AuditLog = sequelize.define('AuditLog', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        // Usuario que realizó la acción (puede ser null para acciones del sistema)
        user_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        // Acción realizada
        action: {
            type: DataTypes.ENUM(
                'CREATE', 'UPDATE', 'DELETE', 'RESTORE',
                'LOGIN', 'LOGOUT', 'LOGIN_FAILED',
                'CANCEL', 'CONFIRM',
                'PASSWORD_CHANGE', 'ROLE_CHANGE'
            ),
            allowNull: false
        },
        // Entidad afectada
        entity_type: {
            type: DataTypes.ENUM('USER', 'RESOURCE', 'RESERVATION', 'AUTH'),
            allowNull: false
        },
        // ID de la entidad afectada
        entity_id: {
            type: DataTypes.UUID,
            allowNull: true
        },
        // Datos anteriores (para cambios)
        old_values: {
            type: DataTypes.JSONB,
            allowNull: true
        },
        // Datos nuevos (para cambios)
        new_values: {
            type: DataTypes.JSONB,
            allowNull: true
        },
        // IP del cliente
        ip_address: {
            type: DataTypes.STRING(45), // IPv6 compatible
            allowNull: true
        },
        // User agent del cliente
        user_agent: {
            type: DataTypes.STRING(500),
            allowNull: true
        },
        // Detalles adicionales
        details: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        // Estado de la operación
        status: {
            type: DataTypes.ENUM('SUCCESS', 'FAILURE'),
            defaultValue: 'SUCCESS',
            allowNull: false
        }
    }, {
        tableName: 'audit_logs',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false, // No necesitamos updated_at para logs
        indexes: [
            {
                fields: ['user_id']
            },
            {
                fields: ['action']
            },
            {
                fields: ['entity_type']
            },
            {
                fields: ['entity_id']
            },
            {
                fields: ['created_at']
            },
            {
                fields: ['status']
            },
            // Índice compuesto para búsquedas comunes
            {
                fields: ['user_id', 'action', 'created_at'],
                name: 'idx_user_action_date'
            }
        ]
    });

    AuditLog.associate = (models) => {
        AuditLog.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'user'
        });
    };

    return AuditLog;
};
