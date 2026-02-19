require('dotenv').config();
const logger = require('../utils/logger');

const baseConfig = {
    database: process.env.DB_NAME || 'reservas_db',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? (msg) => logger.debug(msg) : false,
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
};

// Sequelize CLI requiere exportar por entorno
module.exports = {
    ...baseConfig,
    development: {
        ...baseConfig,
        logging: (msg) => logger.debug(msg)
    },
    test: {
        ...baseConfig,
        database: process.env.DB_NAME || 'reservas_db_test',
        logging: false
    },
    production: {
        ...baseConfig,
        logging: false,
        pool: {
            max: 20,
            min: 5,
            acquire: 30000,
            idle: 10000
        }
    }
};

