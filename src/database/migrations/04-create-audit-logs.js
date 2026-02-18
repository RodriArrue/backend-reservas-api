'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.sequelize.query(
            `CREATE TYPE "enum_audit_logs_action" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'RESTORE', 'LOGIN', 'LOGOUT', 'LOGIN_FAILED', 'CANCEL', 'CONFIRM', 'PASSWORD_CHANGE', 'ROLE_CHANGE');`
        ).catch(() => { });

        await queryInterface.sequelize.query(
            `CREATE TYPE "enum_audit_logs_entity_type" AS ENUM ('USER', 'RESOURCE', 'RESERVATION', 'AUTH');`
        ).catch(() => { });

        await queryInterface.sequelize.query(
            `CREATE TYPE "enum_audit_logs_status" AS ENUM ('SUCCESS', 'FAILURE');`
        ).catch(() => { });

        await queryInterface.createTable('audit_logs', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
                allowNull: false
            },
            user_id: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            action: {
                type: Sequelize.ENUM('CREATE', 'UPDATE', 'DELETE', 'RESTORE', 'LOGIN', 'LOGOUT', 'LOGIN_FAILED', 'CANCEL', 'CONFIRM', 'PASSWORD_CHANGE', 'ROLE_CHANGE'),
                allowNull: false
            },
            entity_type: {
                type: Sequelize.ENUM('USER', 'RESOURCE', 'RESERVATION', 'AUTH'),
                allowNull: false
            },
            entity_id: {
                type: Sequelize.UUID,
                allowNull: true
            },
            old_values: {
                type: Sequelize.JSONB,
                allowNull: true
            },
            new_values: {
                type: Sequelize.JSONB,
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
            details: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            status: {
                type: Sequelize.ENUM('SUCCESS', 'FAILURE'),
                defaultValue: 'SUCCESS',
                allowNull: false
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        // Índices
        await queryInterface.addIndex('audit_logs', ['user_id'], { name: 'audit_logs_user_id' });
        await queryInterface.addIndex('audit_logs', ['action'], { name: 'audit_logs_action' });
        await queryInterface.addIndex('audit_logs', ['entity_type'], { name: 'audit_logs_entity_type' });
        await queryInterface.addIndex('audit_logs', ['entity_id'], { name: 'audit_logs_entity_id' });
        await queryInterface.addIndex('audit_logs', ['created_at'], { name: 'audit_logs_created_at' });
        await queryInterface.addIndex('audit_logs', ['status'], { name: 'audit_logs_status' });
        await queryInterface.addIndex('audit_logs', ['user_id', 'action', 'created_at'], {
            name: 'idx_user_action_date'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('audit_logs');
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_audit_logs_action";');
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_audit_logs_entity_type";');
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_audit_logs_status";');
    }
};
