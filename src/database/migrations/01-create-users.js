'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Crear tipo ENUM para roles
        await queryInterface.sequelize.query(
            `CREATE TYPE "enum_users_rol" AS ENUM ('ADMIN', 'USER');`
        ).catch(() => { }); // Ignorar si ya existe

        await queryInterface.createTable('users', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
                allowNull: false
            },
            nombre: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            email: {
                type: Sequelize.STRING(255),
                allowNull: false
            },
            password: {
                type: Sequelize.STRING(255),
                allowNull: false
            },
            rol: {
                type: Sequelize.ENUM('ADMIN', 'USER'),
                defaultValue: 'USER',
                allowNull: false
            },
            activo: {
                type: Sequelize.BOOLEAN,
                defaultValue: true,
                allowNull: false
            },
            failed_login_attempts: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
                allowNull: false
            },
            locked_until: {
                type: Sequelize.DATE,
                allowNull: true
            },
            last_login: {
                type: Sequelize.DATE,
                allowNull: true
            },
            password_changed_at: {
                type: Sequelize.DATE,
                allowNull: true
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            deletedAt: {
                type: Sequelize.DATE,
                allowNull: true
            }
        });

        // Índices
        await queryInterface.addIndex('users', ['email'], {
            unique: true,
            where: { deletedAt: null },
            name: 'users_email_unique'
        });
        await queryInterface.addIndex('users', ['rol'], { name: 'users_rol' });
        await queryInterface.addIndex('users', ['activo'], { name: 'users_activo' });
        await queryInterface.addIndex('users', ['created_at'], { name: 'users_created_at' });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('users');
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_rol";');
    }
};
