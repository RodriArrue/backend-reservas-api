/**
 * Middleware centralizado de manejo de errores
 * 
 * Captura TODOS los errores de la app y responde con formato consistente.
 * Maneja errores operacionales (AppError) y errores de servicios existentes.
 */

const logger = require('../utils/logger');
const { AppError } = require('../utils/errors');

/**
 * Mapeo de códigos de error de servicios a status HTTP
 */
const SERVICE_ERROR_STATUS_MAP = {
    // UserService
    'EMAIL_DUPLICATED': 409,
    'USER_NOT_FOUND': 404,
    'INVALID_CREDENTIALS': 401,
    'WEAK_PASSWORD': 400,
    'INVALID_EMAIL': 400,
    'MISSING_FIELDS': 400,

    // ReservationService
    'RESOURCE_NOT_FOUND': 404,
    'RESERVATION_NOT_FOUND': 404,
    'SCHEDULE_CONFLICT': 409,
    'INVALID_DATE_RANGE': 400,
    'PAST_RESERVATION': 400,
    'FORBIDDEN': 403,
    'ALREADY_CANCELLED': 400,
    'ALREADY_CONFIRMED': 400,
    'CANNOT_CONFIRM': 400,

    // AuthService
    'ACCOUNT_LOCKED': 423,
    'REFRESH_TOKEN_EXPIRED': 401,
    'REFRESH_TOKEN_REVOKED': 401,
    'REFRESH_TOKEN_INVALID': 400,
    'TOKEN_BLACKLISTED': 401,
    'INVALID_TOKEN': 401
};

/**
 * Determinar el status code para un error de servicio
 */
const getServiceErrorStatus = (error) => {
    if (error.code && SERVICE_ERROR_STATUS_MAP[error.code]) {
        return SERVICE_ERROR_STATUS_MAP[error.code];
    }
    return 400; // Default para errores de servicio conocidos
};

/**
 * Middleware de manejo de errores
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
    // 1. Errores operacionales (AppError) — esperados
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            error: err.message,
            code: err.code
        });
    }

    // 2. Errores de servicios existentes (tienen propiedad .code y .isServiceError o son instanceof custom errors)
    if (err.isServiceError || err.code) {
        const statusCode = getServiceErrorStatus(err);
        return res.status(statusCode).json({
            success: false,
            error: err.message,
            code: err.code
        });
    }

    // 3. Errores de validación de Sequelize
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
        const messages = err.errors?.map(e => e.message) || [err.message];
        return res.status(400).json({
            success: false,
            error: messages.length === 1 ? messages[0] : 'Error de validación',
            errors: messages,
            code: 'VALIDATION_ERROR'
        });
    }

    // 4. Errores inesperados — loguear y devolver 500 genérico
    logger.error('Error no manejado:', err);

    const response = {
        success: false,
        error: 'Error interno del servidor'
    };

    // En desarrollo, incluir detalles del error
    if (process.env.NODE_ENV === 'development') {
        response.stack = err.stack;
        response.detail = err.message;
    }

    res.status(500).json(response);
};

module.exports = errorHandler;
