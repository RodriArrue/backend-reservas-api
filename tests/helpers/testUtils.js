/**
 * Utilidades para tests
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * Genera un token JWT válido para tests
 */
const generateTestToken = (userData = {}) => {
    const defaultUser = {
        id: crypto.randomUUID(),
        email: 'test@example.com',
        rol: 'USER',
        jti: crypto.randomBytes(16).toString('hex')
    };

    const payload = { ...defaultUser, ...userData };
    const secret = process.env.JWT_SECRET || 'test_jwt_secret';

    return jwt.sign(payload, secret, { expiresIn: '1h' });
};

/**
 * Genera un usuario de test
 */
const generateTestUser = (overrides = {}) => ({
    id: crypto.randomUUID(),
    nombre: 'Usuario Test',
    email: `test_${Date.now()}@example.com`,
    password: 'Test123!@#',
    rol: 'USER',
    activo: true,
    ...overrides
});

/**
 * Genera un recurso de test
 */
const generateTestResource = (overrides = {}) => ({
    id: crypto.randomUUID(),
    nombre: `Recurso Test ${Date.now()}`,
    tipo: 'SALA',
    capacidad: 10,
    activo: true,
    ...overrides
});

/**
 * Genera una reserva de test
 */
const generateTestReservation = (overrides = {}) => {
    const startTime = new Date();
    startTime.setHours(startTime.getHours() + 24); // Mañana

    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 1); // 1 hora después

    return {
        id: crypto.randomUUID(),
        user_id: crypto.randomUUID(),
        resource_id: crypto.randomUUID(),
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        status: 'PENDING',
        ...overrides
    };
};

/**
 * Mock de request para tests de servicios
 */
const mockRequest = (overrides = {}) => ({
    headers: {
        'x-forwarded-for': '127.0.0.1',
        'user-agent': 'Jest Test Agent'
    },
    socket: { remoteAddress: '127.0.0.1' },
    ip: '127.0.0.1',
    ...overrides
});

/**
 * Espera un tiempo determinado
 */
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Limpia tablas de la base de datos (para tests de integración)
 */
const cleanDatabase = async () => {
    const { sequelize } = require('../../src/models');

    // Desactivar verificación de FK temporalmente
    await sequelize.query('SET session_replication_role = replica;');

    // Limpiar tablas en orden
    const tables = ['audit_logs', 'token_blacklist', 'refresh_tokens', 'reservations', 'resources', 'users'];
    for (const table of tables) {
        try {
            await sequelize.query(`TRUNCATE TABLE ${table} CASCADE;`);
        } catch (error) {
            // Ignorar si la tabla no existe
        }
    }

    // Reactivar verificación de FK
    await sequelize.query('SET session_replication_role = DEFAULT;');
};

module.exports = {
    generateTestToken,
    generateTestUser,
    generateTestResource,
    generateTestReservation,
    mockRequest,
    wait,
    cleanDatabase
};
