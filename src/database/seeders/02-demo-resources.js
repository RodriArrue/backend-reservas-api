'use strict';

const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const now = new Date();

        const resources = [
            {
                id: uuidv4(),
                nombre: 'Sala de Reuniones A',
                tipo: 'SALA',
                capacidad: 10,
                activo: true,
                created_at: now,
                updated_at: now
            },
            {
                id: uuidv4(),
                nombre: 'Sala de Reuniones B',
                tipo: 'SALA',
                capacidad: 6,
                activo: true,
                created_at: now,
                updated_at: now
            },
            {
                id: uuidv4(),
                nombre: 'Escritorio Coworking 1',
                tipo: 'ESCRITORIO',
                capacidad: 1,
                activo: true,
                created_at: now,
                updated_at: now
            },
            {
                id: uuidv4(),
                nombre: 'Escritorio Coworking 2',
                tipo: 'ESCRITORIO',
                capacidad: 1,
                activo: true,
                created_at: now,
                updated_at: now
            },
            {
                id: uuidv4(),
                nombre: 'Consultorio Dr. Rodríguez',
                tipo: 'CONSULTORIO',
                capacidad: 3,
                activo: true,
                created_at: now,
                updated_at: now
            },
            {
                id: uuidv4(),
                nombre: 'Consultorio Dra. Fernández',
                tipo: 'CONSULTORIO',
                capacidad: 3,
                activo: false,
                created_at: now,
                updated_at: now
            }
        ];

        await queryInterface.bulkInsert('resources', resources);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('resources', {
            nombre: {
                [Sequelize.Op.in]: [
                    'Sala de Reuniones A',
                    'Sala de Reuniones B',
                    'Escritorio Coworking 1',
                    'Escritorio Coworking 2',
                    'Consultorio Dr. Rodríguez',
                    'Consultorio Dra. Fernández'
                ]
            }
        });
    }
};
