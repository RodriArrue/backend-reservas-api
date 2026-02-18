'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.sequelize.query(
            `CREATE TYPE "enum_resources_tipo" AS ENUM ('SALA', 'ESCRITORIO', 'CONSULTORIO');`
        ).catch(() => { });

        await queryInterface.createTable('resources', {
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
            tipo: {
                type: Sequelize.ENUM('SALA', 'ESCRITORIO', 'CONSULTORIO'),
                allowNull: false
            },
            capacidad: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 1
            },
            activo: {
                type: Sequelize.BOOLEAN,
                defaultValue: true,
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
        await queryInterface.addIndex('resources', ['tipo'], { name: 'resources_tipo' });
        await queryInterface.addIndex('resources', ['activo'], { name: 'resources_activo' });
        await queryInterface.addIndex('resources', ['capacidad'], { name: 'resources_capacidad' });
        await queryInterface.addIndex('resources', ['created_at'], { name: 'resources_created_at' });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('resources');
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_resources_tipo";');
    }
};
