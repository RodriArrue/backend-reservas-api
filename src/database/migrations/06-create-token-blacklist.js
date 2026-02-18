'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.sequelize.query(
            `CREATE TYPE "enum_token_blacklist_reason" AS ENUM ('LOGOUT', 'PASSWORD_CHANGE', 'SECURITY_BREACH', 'ADMIN_REVOKE');`
        ).catch(() => { });

        await queryInterface.createTable('token_blacklist', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
                allowNull: false
            },
            token_jti: {
                type: Sequelize.STRING(100),
                allowNull: false,
                unique: true
            },
            user_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            expires_at: {
                type: Sequelize.DATE,
                allowNull: false
            },
            reason: {
                type: Sequelize.ENUM('LOGOUT', 'PASSWORD_CHANGE', 'SECURITY_BREACH', 'ADMIN_REVOKE'),
                allowNull: false
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        // Índices
        await queryInterface.addIndex('token_blacklist', ['token_jti'], {
            unique: true,
            name: 'token_blacklist_jti_unique'
        });
        await queryInterface.addIndex('token_blacklist', ['user_id'], { name: 'token_blacklist_user_id' });
        await queryInterface.addIndex('token_blacklist', ['expires_at'], { name: 'token_blacklist_expires_at' });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('token_blacklist');
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_token_blacklist_reason";');
    }
};
