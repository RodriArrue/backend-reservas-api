/**
 * Script para sincronizar los modelos con la base de datos
 * 
 * Uso:
 *   node src/scripts/sync-db.js        - Sincroniza sin eliminar datos (alter)
 *   node src/scripts/sync-db.js --force - Elimina y recrea todas las tablas
 */

const { sequelize } = require('../models');

const force = process.argv.includes('--force');

async function syncDatabase() {
    try {
        console.log(' Conectando a la base de datos...');

        await sequelize.authenticate();
        console.log(' Conexión establecida correctamente.');

        console.log(` Sincronizando modelos${force ? ' (FORCE: eliminando datos existentes)' : ''}...`);

        await sequelize.sync({ alter: !force, force });

        console.log(' Modelos sincronizados correctamente.');
        console.log('\n Tablas creadas:');
        console.log('   - users');
        console.log('   - resources');
        console.log('   - reservations');

        process.exit(0);
    } catch (error) {
        console.error(' Error al sincronizar la base de datos:', error.message);
        process.exit(1);
    }
}

syncDatabase();
