const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Reservation = sequelize.define('Reservation', {
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
        resource_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'resources',
                key: 'id'
            }
        },
        start_time: {
            type: DataTypes.DATE,
            allowNull: false,
            validate: {
                isDate: true
            }
        },
        end_time: {
            type: DataTypes.DATE,
            allowNull: false,
            validate: {
                isDate: true,
                isAfterStart(value) {
                    if (value <= this.start_time) {
                        throw new Error('end_time debe ser posterior a start_time');
                    }
                }
            }
        },
        status: {
            type: DataTypes.ENUM('PENDING', 'CONFIRMED', 'CANCELLED'),
            defaultValue: 'PENDING',
            allowNull: false
        },
        deletedAt: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        tableName: 'reservations',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        paranoid: true, // Habilita soft delete
        indexes: [
            {
                fields: ['user_id']
            },
            {
                fields: ['resource_id']
            },
            {
                fields: ['start_time']
            },
            {
                fields: ['end_time']
            },
            {
                fields: ['status']
            },
            {
                fields: ['created_at']
            },
            // Índice compuesto para búsquedas de disponibilidad
            {
                fields: ['resource_id', 'start_time', 'end_time'],
                name: 'idx_resource_time_range'
            },
            // Índice compuesto para reservas de un usuario en un rango de tiempo
            {
                fields: ['user_id', 'start_time', 'end_time'],
                name: 'idx_user_time_range'
            }
        ]
    });

    Reservation.associate = (models) => {
        Reservation.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'user'
        });
        Reservation.belongsTo(models.Resource, {
            foreignKey: 'resource_id',
            as: 'resource'
        });
    };

    return Reservation;
};
