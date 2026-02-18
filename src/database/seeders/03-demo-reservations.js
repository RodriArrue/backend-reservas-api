'use strict';

const { v4: uuidv4 } = require('uuid');

/**
 * Genera reservas relativas a la fecha actual
 * para que siempre haya datos relevantes al probar
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Obtener usuarios y recursos existentes
        const users = await queryInterface.sequelize.query(
            `SELECT id, nombre FROM users WHERE rol = 'USER' ORDER BY created_at ASC LIMIT 3;`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        const resources = await queryInterface.sequelize.query(
            `SELECT id, nombre FROM resources WHERE activo = true ORDER BY created_at ASC LIMIT 5;`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        if (users.length < 3 || resources.length < 5) {
            console.log('   ⚠️  Se necesitan al menos 3 usuarios y 5 recursos. Ejecutá primero los seeders anteriores.');
            return;
        }

        const today = new Date();
        const now = new Date();

        const addDays = (date, days) => {
            const result = new Date(date);
            result.setDate(result.getDate() + days);
            return result;
        };

        const setTime = (date, hours, minutes = 0) => {
            const result = new Date(date);
            result.setHours(hours, minutes, 0, 0);
            return result;
        };

        const reservations = [
            // Reserva de hoy - CONFIRMED
            {
                id: uuidv4(),
                user_id: users[0].id,
                resource_id: resources[0].id,
                start_time: setTime(today, 9, 0),
                end_time: setTime(today, 10, 30),
                status: 'CONFIRMED',
                created_at: addDays(now, -2),
                updated_at: addDays(now, -1)
            },
            // Reserva de hoy - PENDING
            {
                id: uuidv4(),
                user_id: users[1].id,
                resource_id: resources[1].id,
                start_time: setTime(today, 14, 0),
                end_time: setTime(today, 15, 0),
                status: 'PENDING',
                created_at: addDays(now, -1),
                updated_at: addDays(now, -1)
            },
            // Reserva de mañana - CONFIRMED (día completo escritorio)
            {
                id: uuidv4(),
                user_id: users[2].id,
                resource_id: resources[2].id,
                start_time: setTime(addDays(today, 1), 8, 0),
                end_time: setTime(addDays(today, 1), 17, 0),
                status: 'CONFIRMED',
                created_at: addDays(now, -3),
                updated_at: addDays(now, -2)
            },
            // Reserva de mañana - PENDING (consultorio)
            {
                id: uuidv4(),
                user_id: users[0].id,
                resource_id: resources[4].id,
                start_time: setTime(addDays(today, 1), 10, 0),
                end_time: setTime(addDays(today, 1), 11, 0),
                status: 'PENDING',
                created_at: now,
                updated_at: now
            },
            // Reserva en 3 días - CONFIRMED
            {
                id: uuidv4(),
                user_id: users[1].id,
                resource_id: resources[0].id,
                start_time: setTime(addDays(today, 3), 11, 0),
                end_time: setTime(addDays(today, 3), 12, 30),
                status: 'CONFIRMED',
                created_at: addDays(now, -1),
                updated_at: now
            },
            // Reserva en 5 días - PENDING
            {
                id: uuidv4(),
                user_id: users[2].id,
                resource_id: resources[1].id,
                start_time: setTime(addDays(today, 5), 16, 0),
                end_time: setTime(addDays(today, 5), 18, 0),
                status: 'PENDING',
                created_at: now,
                updated_at: now
            },
            // Reserva pasada (ayer) - CONFIRMED
            {
                id: uuidv4(),
                user_id: users[0].id,
                resource_id: resources[3].id,
                start_time: setTime(addDays(today, -1), 9, 0),
                end_time: setTime(addDays(today, -1), 13, 0),
                status: 'CONFIRMED',
                created_at: addDays(now, -5),
                updated_at: addDays(now, -4)
            },
            // Reserva cancelada
            {
                id: uuidv4(),
                user_id: users[1].id,
                resource_id: resources[4].id,
                start_time: setTime(addDays(today, 2), 15, 0),
                end_time: setTime(addDays(today, 2), 16, 0),
                status: 'CANCELLED',
                created_at: addDays(now, -2),
                updated_at: addDays(now, -1)
            }
        ];

        await queryInterface.bulkInsert('reservations', reservations);

        console.log(`   ✅ ${reservations.length} reservas de ejemplo creadas`);
    },

    async down(queryInterface, Sequelize) {
        // Eliminar todas las reservas (en seeds esto es aceptable)
        await queryInterface.bulkDelete('reservations', null, {});
    }
};
