require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { sequelize } = require('./models');
const routes = require('./routes');
const { globalLimiter } = require('./middlewares');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares de seguridad
app.use(helmet()); // Headers de seguridad HTTP
app.use(globalLimiter); // Rate limiting global

// Middlewares de parsing
app.use(cors());
app.use(express.json({ limit: '10kb' })); // Limitar tamaño de body
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

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
        console.log('Conexión a la base de datos establecida.');

        app.listen(PORT, () => {
            console.log(`Servidor corriendo en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Error al iniciar el servidor:', error.message);
        process.exit(1);
    }
}

startServer();
