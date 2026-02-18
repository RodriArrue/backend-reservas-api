'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('refresh_tokens', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
                allowNull: false
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
            token: {
                type: Sequelize.STRING(500),
                allowNull: false,
                unique: true
            },
            access_token_jti: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            expires_at: {
                type: Sequelize.DATE,
                allowNull: false
            },
            revoked: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
                allowNull: false
            },
            revoked_at: {
                type: Sequelize.DATE,
                allowNull: true
            },
            ip_address: {
                type: Sequelize.STRING(45),
                allowNull: true
            },
            user_agent: {
                type: Sequelize.STRING(500),
                allowNull: true
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        // Índices
        await queryInterface.addIndex('refresh_tokens', ['user_id'], { name: 'refresh_tokens_user_id' });
        await queryInterface.addIndex('refresh_tokens', ['token'], { name: 'refresh_tokens_token' });
        await queryInterface.addIndex('refresh_tokens', ['access_token_jti'], { name: 'refresh_tokens_jti' });
        await queryInterface.addIndex('refresh_tokens', ['expires_at'], { name: 'refresh_tokens_expires_at' });
        await queryInterface.addIndex('refresh_tokens', ['revoked'], { name: 'refresh_tokens_revoked' });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('refresh_tokens');
    }
};
