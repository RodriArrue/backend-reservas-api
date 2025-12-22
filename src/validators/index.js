/**
 * Índice de validadores
 * Exporta todos los validadores y el middleware de manejo de errores
 */

const { validationResult } = require('express-validator');

// Importar validadores
const userValidator = require('./userValidator');
const resourceValidator = require('./resourceValidator');
const reservationValidator = require('./reservationValidator');

/**
 * Middleware para manejar errores de validación
 * Debe usarse después de las reglas de validación
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: 'Error de validación',
            code: 'VALIDATION_ERROR',
            details: errors.array().map(err => ({
                field: err.path,
                message: err.msg,
                value: err.value
            }))
        });
    }

    next();
};

module.exports = {
    validate,
    // User validators
    ...userValidator,
    // Resource validators
    ...resourceValidator,
    // Reservation validators
    ...reservationValidator
};
