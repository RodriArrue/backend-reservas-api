/**
 * App de Express exportable para tests
 * Este archivo configura la app SIN iniciar el servidor
 */

require('dotenv').config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const hpp = require('hpp');
const routes = require('./routes');
const { globalLimiter } = require('./middlewares');
const { xssSanitizer, noSqlSanitizer } = require('./middlewares/sanitizerMiddleware');
const errorHandler = require('./middlewares/errorHandler');
const { NotFoundError } = require('./utils/errors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const app = express();

// Middlewares de seguridad (desactivar rate limiting en tests)
app.use(helmet());
if (process.env.NODE_ENV !== 'test') {
    app.use(globalLimiter);
}

// Middlewares de parsing
app.use(cors());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Sanitización y protección adicional
app.use(hpp());
app.use(xssSanitizer);
app.use(noSqlSanitizer);

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

// Documentación Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'Sistema de Reservas - API Docs',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
        persistAuthorization: true
    }
}));

// Endpoint para obtener el JSON de la especificación
app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

// Rutas de la API
app.use('/api', routes);

// 404 para rutas no encontradas
app.use((req, res, next) => {
    next(new NotFoundError(`Ruta ${req.originalUrl}`));
});

// Error handler centralizado
app.use(errorHandler);

module.exports = app;

