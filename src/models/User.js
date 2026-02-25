const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        username: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
            validate: {
                len: [3, 50],
            },
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
        firstName: {
            type: DataTypes.STRING(50),
            allowNull: true,
            field: 'first_name',
        },
        lastName: {
            type: DataTypes.STRING(50),
            allowNull: true,
            field: 'last_name',
        },
        activo: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: false
        },
        // Account lockout fields
        failed_login_attempts: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false
        },
        locked_until: {
            type: DataTypes.DATE,
            allowNull: true
        },
        last_login: {
            type: DataTypes.DATE,
            allowNull: true
        },
        // Fecha del último cambio de contraseña (para forzar re-login)
        password_changed_at: {
            type: DataTypes.DATE,
            allowNull: true
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
                unique: true,
                fields: ['username'],
                where: {
                    deletedAt: null
                }
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

        // Un usuario puede tener muchos roles (Many-to-Many)
        User.belongsToMany(models.Role, {
            through: 'user_roles',
            foreignKey: 'user_id',
            otherKey: 'role_id',
            as: 'roles',
        });
    };

    return User;
};
