/**
 * Script para sincronizar los modelos con la base de datos
 * 
 * Uso:
 *   node src/scripts/sync-db.js        - Sincroniza sin eliminar datos (alter)
 *   node src/scripts/sync-db.js --force - Elimina y recrea todas las tablas
 */

const { sequelize } = require('../models');
const logger = require('../utils/logger');

const force = process.argv.includes('--force');

async function syncDatabase() {
    try {
        logger.info('Conectando a la base de datos...');

        await sequelize.authenticate();
        logger.info('Conexión establecida correctamente');

        logger.info(`Sincronizando modelos${force ? ' (FORCE: eliminando datos existentes)' : ''}...`);

        await sequelize.sync({ alter: !force, force });

        logger.info('Modelos sincronizados correctamente');
        logger.info('Tablas creadas: users, resources, reservations');

        process.exit(0);
    } catch (error) {
        logger.error('Error al sincronizar la base de datos:', error);
        process.exit(1);
    }
}

syncDatabase();
