require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const hpp = require('hpp');
const { sequelize } = require('./models');
const routes = require('./routes');
const { globalLimiter } = require('./middlewares');
const { xssSanitizer, noSqlSanitizer } = require('./middlewares/sanitizerMiddleware');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares de seguridad
app.use(helmet()); // Headers de seguridad HTTP
app.use(globalLimiter); // Rate limiting global

// Middlewares de parsing
app.use(cors());
app.use(express.json({ limit: '10kb' })); // Limitar tamaño de body
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Sanitización y protección adicional
app.use(hpp()); // Prevenir HTTP Parameter Pollution
app.use(xssSanitizer); // Sanitizar XSS en body, query, params
app.use(noSqlSanitizer); // Prevenir NoSQL injection

// Ruta de health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Ruta principal
app.get('/', (req, res) => {
    res.json({
        message: 'Sistema de Reservas API',
        version: '1.0.0',
        endpoints: {
            users: '/api/users',
            resources: '/api/resources',
            reservations: '/api/reservations'
        }
    });
});

// Rutas de la API
app.use('/api', routes);

// Iniciar servidor
async function startServer() {
    try {
        // Verificar conexión a la base de datos
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
