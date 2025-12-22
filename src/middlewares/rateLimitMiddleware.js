/**
 * Middlewares de Rate Limiting
 * Limita el número de requests para prevenir abuso
 */

const rateLimit = require('express-rate-limit');

/**
 * Limiter global: 100 requests por IP cada 15 minutos
 */
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máximo 100 requests por ventana
    message: {
        success: false,
        error: 'Demasiadas solicitudes, por favor intenta más tarde',
        code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true, // Retorna info de rate limit en headers `RateLimit-*`
    legacyHeaders: false // Deshabilita headers `X-RateLimit-*`
});

/**
 * Limiter para autenticación: 5 intentos cada 15 minutos
 * Más estricto para prevenir ataques de fuerza bruta
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // máximo 5 intentos por ventana
    message: {
        success: false,
        error: 'Demasiados intentos de inicio de sesión, intenta en 15 minutos',
        code: 'AUTH_RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true // No cuenta requests exitosos
});

/**
 * Limiter para creación de recursos: 20 por hora
 * Previene spam de creación de reservas/recursos
 */
const createLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 20, // máximo 20 creaciones por hora
    message: {
        success: false,
        error: 'Límite de creaciones alcanzado, intenta más tarde',
        code: 'CREATE_RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = {
    globalLimiter,
    authLimiter,
    createLimiter
};
