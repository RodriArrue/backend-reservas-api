const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const User = sequelize.define('User', {
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
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
                notEmpty: true
            }
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [6, 255]
            }
        },
        rol: {
            type: DataTypes.ENUM('ADMIN', 'USER'),
            defaultValue: 'USER',
            allowNull: false
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
        tableName: 'users',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        paranoid: true, // Habilita soft delete
        indexes: [
            {
                unique: true,
                fields: ['email'],
                where: {
                    deletedAt: null
                }
            },
            {
                fields: ['rol']
            },
            {
                fields: ['activo']
            },
            {
                fields: ['created_at']
            }
        ]
    });

    User.associate = (models) => {
        User.hasMany(models.Reservation, {
            foreignKey: 'user_id',
            as: 'reservations'
        });
    };

    return User;
};
