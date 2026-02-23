/**
 * Validadores para Reservation
 */

const { body, param, query } = require('express-validator');

/**
 * Reglas para crear reserva
 */
const createReservationRules = [
    body('resource_id')
        .notEmpty().withMessage('El ID del recurso es requerido')
        .isUUID().withMessage('ID de recurso inválido'),

    body('start_time')
        .notEmpty().withMessage('La fecha de inicio es requerida')
        .isISO8601().withMessage('Fecha de inicio inválida. Use formato ISO 8601')
        .custom((value) => {
            if (new Date(value) < new Date()) {
                throw new Error('La fecha de inicio no puede ser en el pasado');
            }
            return true;
        }),

    body('end_time')
        .notEmpty().withMessage('La fecha de fin es requerida')
        .isISO8601().withMessage('Fecha de fin inválida. Use formato ISO 8601')
        .custom((value, { req }) => {
            if (new Date(value) <= new Date(req.body.start_time)) {
                throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
            }
            return true;
        }),

    body('user_id')
        .optional()
        .isUUID().withMessage('ID de usuario inválido')
];

/**
 * Reglas para actualizar reserva
 */
const updateReservationRules = [
    param('id')
        .isUUID().withMessage('ID de reserva inválido'),

    body('start_time')
        .optional()
        .isISO8601().withMessage('Fecha de inicio inválida'),

    body('end_time')
        .optional()
        .isISO8601().withMessage('Fecha de fin inválida'),

    body('status')
        .optional()
        .isIn(['PENDING', 'CONFIRMED', 'CANCELLED']).withMessage('Estado inválido')
];

/**
 * Reglas para parámetro ID
 */
const idParamRules = [
    param('id')
        .isUUID().withMessage('ID de reserva inválido')
];

/**
 * Reglas para buscar reservas
 */
const findReservationsRules = [
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('page debe ser mayor a 0')
        .toInt(),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('limit debe estar entre 1 y 100')
        .toInt(),

    query('userId')
        .optional()
        .isUUID().withMessage('userId inválido'),

    query('resourceId')
        .optional()
        .isUUID().withMessage('resourceId inválido'),

    query('status')
        .optional()
        .isIn(['PENDING', 'CONFIRMED', 'CANCELLED']).withMessage('status inválido'),

    query('startDate')
        .optional()
        .isISO8601().withMessage('startDate inválida'),

    query('endDate')
        .optional()
        .isISO8601().withMessage('endDate inválida')
];

module.exports = {
    createReservationRules,
    updateReservationRules,
    idParamRules,
    findReservationsRules
};
