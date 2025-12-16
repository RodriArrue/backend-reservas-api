const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Resource = sequelize.define('Resource', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        nombre: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [2, 100]
            }
        },
        tipo: {
            type: DataTypes.ENUM('SALA', 'ESCRITORIO', 'CONSULTORIO'),
            allowNull: false
        },
        capacidad: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            validate: {
                min: 1,
                isInt: true
            }
        },
        activo: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: false
        },
        deletedAt: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        tableName: 'resources',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        paranoid: true, // Habilita soft delete
        indexes: [
            {
                fields: ['tipo']
            },
            {
                fields: ['activo']
            },
            {
                fields: ['capacidad']
            },
            {
                fields: ['created_at']
            }
        ]
    });

    Resource.associate = (models) => {
        Resource.hasMany(models.Reservation, {
            foreignKey: 'resource_id',
            as: 'reservations'
        });
    };

    return Resource;
};
