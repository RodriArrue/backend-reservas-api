/**
 * Configuración de Jest
 */
module.exports = {
    // Ambiente de test
    testEnvironment: 'node',

    // Directorio raíz de tests
    roots: ['<rootDir>/tests'],

    // Patrón de archivos de test
    testMatch: [
        '**/*.test.js',
        '**/*.spec.js'
    ],

    // Archivos a ignorar
    testPathIgnorePatterns: [
        '/node_modules/'
    ],

    // Configuración de cobertura
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/index.js',
        '!src/config/**',
        '!src/scripts/**'
    ],

    // Directorio de cobertura
    coverageDirectory: 'coverage',

    // Umbrales mínimos de cobertura
    coverageThreshold: {
        global: {
            branches: 50,
            functions: 50,
            lines: 50,
            statements: 50
        }
    },

    // Setup antes de todos los tests
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

    // Timeout para tests
    testTimeout: 10000,

    // Verbose output
    verbose: true,

    // Limpiar mocks entre tests
    clearMocks: true,

    // Restaurar mocks
    restoreMocks: true
};
