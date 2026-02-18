'use strict';

const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const now = new Date();

        const users = [
            {
                id: uuidv4(),
                nombre: 'Administrador',
                email: 'admin@reservas.com',
                password: await bcrypt.hash('Admin123!', 10),
                rol: 'ADMIN',
                activo: true,
                failed_login_attempts: 0,
                created_at: now,
                updated_at: now
            },
            {
                id: uuidv4(),
                nombre: 'María García',
                email: 'maria.garcia@ejemplo.com',
                password: await bcrypt.hash('User123!', 10),
                rol: 'USER',
                activo: true,
                failed_login_attempts: 0,
                created_at: now,
                updated_at: now
            },
            {
                id: uuidv4(),
                nombre: 'Carlos López',
                email: 'carlos.lopez@ejemplo.com',
                password: await bcrypt.hash('User123!', 10),
                rol: 'USER',
                activo: true,
                failed_login_attempts: 0,
                created_at: now,
                updated_at: now
            },
            {
                id: uuidv4(),
                nombre: 'Ana Martínez',
                email: 'ana.martinez@ejemplo.com',
                password: await bcrypt.hash('User123!', 10),
                rol: 'USER',
                activo: true,
                failed_login_attempts: 0,
                created_at: now,
                updated_at: now
            }
        ];

        await queryInterface.bulkInsert('users', users);

        console.log('\n   🔑 Credenciales de prueba:');
        console.log('   ┌──────────────────────────────────────────────┐');
        console.log('   │  ADMIN: admin@reservas.com / Admin123!       │');
        console.log('   │  USER:  maria.garcia@ejemplo.com / User123!  │');
        console.log('   └──────────────────────────────────────────────┘\n');
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('users', {
            email: {
                [Sequelize.Op.in]: [
                    'admin@reservas.com',
                    'maria.garcia@ejemplo.com',
                    'carlos.lopez@ejemplo.com',
                    'ana.martinez@ejemplo.com'
                ]
            }
        });
    }
};
