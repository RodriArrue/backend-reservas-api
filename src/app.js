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

// Rutas de la API
app.use('/api', routes);

// Error handler para tests
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        error: err.message
    });
});

module.exports = app;
