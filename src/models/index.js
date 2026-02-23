const { Sequelize } = require('sequelize');
const config = require('../config/database');

// Crear instancia de Sequelize
const sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    {
        host: config.host,
        port: config.port,
        dialect: config.dialect,
        logging: config.logging,
        pool: config.pool,
        define: {
            freezeTableName: true
        }
    }
);

// Importar modelos
const User = require('./User')(sequelize);
const Resource = require('./Resource')(sequelize);
const Reservation = require('./Reservation')(sequelize);
const AuditLog = require('./AuditLog')(sequelize);
const RefreshToken = require('./RefreshToken')(sequelize);
const TokenBlacklist = require('./TokenBlacklist')(sequelize);

// Objeto con todos los modelos
const models = {
    User,
    Resource,
    Reservation,
    AuditLog,
    RefreshToken,
    TokenBlacklist
};

// Ejecutar asociaciones
Object.keys(models).forEach((modelName) => {
    if (models[modelName].associate) {
        models[modelName].associate(models);
    }
});

module.exports = {
    sequelize,
    Sequelize,
    ...models
};
