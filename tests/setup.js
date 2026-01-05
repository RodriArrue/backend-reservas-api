/**
 * Setup global para tests
 * Se ejecuta antes de todos los tests
 */

// Cargar variables de ambiente de test
require('dotenv').config({ path: '.env.test' });

// Timeout global más largo para tests de integración
jest.setTimeout(10000);

// Silenciar console.log durante tests (opcional)
if (process.env.SILENT_TESTS === 'true') {
    global.console = {
        ...console,
        log: jest.fn(),
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        // Mantener error para debugging
        error: console.error
    };
}

// Limpiar mocks después de cada test
afterEach(() => {
    jest.clearAllMocks();
});

// Cerrar conexiones después de todos los tests
afterAll(async () => {
    // Cerrar conexión a base de datos si existe
    try {
        const { sequelize } = require('../src/models');
        await sequelize.close();
    } catch (error) {
        // Ignorar si no hay conexión
    }
});
