const { sequelize } = require('./models');
const logger = require('./utils/logger');
const validateEnv = require('./config/validateEnv');

const app = require('./app');

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        if (!validateEnv()) {
            process.exit(1);
        }

        await sequelize.authenticate();
        logger.info('Conexión a la base de datos establecida');

        app.listen(PORT, () => {
            logger.info(`Servidor corriendo en http://localhost:${PORT}`);
        });
    } catch (error) {
        logger.error('Error al iniciar el servidor:', error);
        process.exit(1);
    }
}

startServer();
