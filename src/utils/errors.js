/**
 * Clases de error personalizadas
 * 
 * Jerarquía:
 *   AppError (base)
 *   ├── ValidationError (400)
 *   ├── UnauthorizedError (401)
 *   ├── ForbiddenError (403)
 *   ├── NotFoundError (404)
 *   └── ConflictError (409)
 */

class AppError extends Error {
    constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

class ValidationError extends AppError {
    constructor(message, code = 'VALIDATION_ERROR') {
        super(message, 400, code);
    }
}

class UnauthorizedError extends AppError {
    constructor(message = 'No autorizado', code = 'UNAUTHORIZED') {
        super(message, 401, code);
    }
}

class ForbiddenError extends AppError {
    constructor(message = 'Acceso denegado', code = 'FORBIDDEN') {
        super(message, 403, code);
    }
}

class NotFoundError extends AppError {
    constructor(resource = 'Recurso', code = 'NOT_FOUND') {
        super(`${resource} no encontrado`, 404, code);
    }
}

class ConflictError extends AppError {
    constructor(message, code = 'CONFLICT') {
        super(message, 409, code);
    }
}

module.exports = {
    AppError,
    ValidationError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ConflictError
};
