/**
 * Validación de variables de entorno al inicio
 * 
 * Verifica que las variables críticas estén definidas antes
 * de iniciar la aplicación. Falla rápido con mensajes claros.
 */

const logger = require('../utils/logger');

/**
 * Variables requeridas según el entorno
 */
const REQUIRED_VARS = {
    // Siempre requeridas (excepto en test)
    base: [
        { name: 'DB_NAME', description: 'Nombre de la base de datos' },
        { name: 'DB_USER', description: 'Usuario de la base de datos' },
        { name: 'DB_PASSWORD', description: 'Contraseña de la base de datos' }
    ],
    // Solo requeridas en producción
    production: [
        { name: 'JWT_SECRET', description: 'Secreto para firmar tokens JWT' },
        { name: 'REFRESH_TOKEN_SECRET', description: 'Secreto para refresh tokens' }
    ]
};

/**
 * Variables con valores por defecto inseguros (warn en producción)
 */
const INSECURE_DEFAULTS = [
    { name: 'JWT_SECRET', insecureValues: ['default_secret_change_in_production'] },
    { name: 'REFRESH_TOKEN_SECRET', insecureValues: ['refresh_secret_change_in_production'] },
    { name: 'CSRF_SECRET', insecureValues: ['csrf-token-secret'] }
];

/**
 * Valida las variables de entorno
 * @returns {boolean} true si la validación pasa
 */
const validateEnv = () => {
    const env = process.env.NODE_ENV || 'development';
    const errors = [];
    const warnings = [];

    // No validar en tests
    if (env === 'test') {
        return true;
    }

    // Verificar variables requeridas base
    for (const variable of REQUIRED_VARS.base) {
        if (!process.env[variable.name]) {
            errors.push(`  ✗ ${variable.name} — ${variable.description}`);
        }
    }

    // Verificar variables requeridas en producción
    if (env === 'production') {
        for (const variable of REQUIRED_VARS.production) {
            if (!process.env[variable.name]) {
                errors.push(`  ✗ ${variable.name} — ${variable.description}`);
            }
        }
    }

    // Verificar valores inseguros en producción
    if (env === 'production') {
        for (const check of INSECURE_DEFAULTS) {
            const value = process.env[check.name];
            if (value && check.insecureValues.includes(value)) {
                warnings.push(`  ⚠ ${check.name} está usando un valor por defecto inseguro`);
            }
        }
    }

    // Verificar PORT válido
    if (process.env.PORT) {
        const port = parseInt(process.env.PORT, 10);
        if (isNaN(port) || port < 1 || port > 65535) {
            errors.push(`  ✗ PORT — Debe ser un número entre 1 y 65535 (actual: ${process.env.PORT})`);
        }
    }

    // Verificar DB_PORT válido
    if (process.env.DB_PORT) {
        const dbPort = parseInt(process.env.DB_PORT, 10);
        if (isNaN(dbPort) || dbPort < 1 || dbPort > 65535) {
            errors.push(`  ✗ DB_PORT — debe ser un número entre 1 y 65535 (actual: ${process.env.DB_PORT})`);
        }
    }

    // Reportar warnings
    if (warnings.length > 0) {
        logger.warn('⚠ Variables de entorno con valores inseguros:');
        warnings.forEach((w) => logger.warn(w));
    }

    // Reportar errores y forzar salida
    if (errors.length > 0) {
        logger.error('❌ Variables de entorno faltantes o inválidas:');
        errors.forEach((e) => logger.error(e));
        logger.error('');
        logger.error('Consultá el archivo .env.example para ver las variables necesarias.');
        return false;
    }

    logger.info('✅ Variables de entorno validadas correctamente');
    return true;
};

module.exports = validateEnv;
