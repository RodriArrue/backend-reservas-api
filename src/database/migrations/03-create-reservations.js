'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.sequelize.query(
            `CREATE TYPE "enum_reservations_status" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');`
        ).catch(() => { });

        await queryInterface.createTable('reservations', {
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
            resource_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'resources',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            start_time: {
                type: Sequelize.DATE,
                allowNull: false
            },
            end_time: {
                type: Sequelize.DATE,
                allowNull: false
            },
            status: {
                type: Sequelize.ENUM('PENDING', 'CONFIRMED', 'CANCELLED'),
                defaultValue: 'PENDING',
                allowNull: false
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
        await queryInterface.addIndex('reservations', ['user_id'], { name: 'reservations_user_id' });
        await queryInterface.addIndex('reservations', ['resource_id'], { name: 'reservations_resource_id' });
        await queryInterface.addIndex('reservations', ['start_time'], { name: 'reservations_start_time' });
        await queryInterface.addIndex('reservations', ['end_time'], { name: 'reservations_end_time' });
        await queryInterface.addIndex('reservations', ['status'], { name: 'reservations_status' });
        await queryInterface.addIndex('reservations', ['created_at'], { name: 'reservations_created_at' });
        await queryInterface.addIndex('reservations', ['resource_id', 'start_time', 'end_time'], {
            name: 'idx_resource_time_range'
        });
        await queryInterface.addIndex('reservations', ['user_id', 'start_time', 'end_time'], {
            name: 'idx_user_time_range'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('reservations');
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_reservations_status";');
    }
};
