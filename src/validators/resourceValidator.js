/**
 * Validadores para Resource
 */

const { body, param, query } = require('express-validator');

/**
 * Reglas para crear recurso
 */
const createResourceRules = [
    body('nombre')
        .trim()
        .notEmpty().withMessage('El nombre es requerido')
        .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres')
        .escape(),

    body('tipo')
        .notEmpty().withMessage('El tipo es requerido')
        .isIn(['SALA', 'ESCRITORIO', 'CONSULTORIO']).withMessage('Tipo inválido. Debe ser SALA, ESCRITORIO o CONSULTORIO'),

    body('capacidad')
        .optional()
        .isInt({ min: 1 }).withMessage('La capacidad debe ser un número entero mayor a 0')
        .toInt()
];

/**
 * Reglas para actualizar recurso
 */
const updateResourceRules = [
    param('id')
        .isUUID().withMessage('ID de recurso inválido'),

    body('nombre')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres')
        .escape(),

    body('tipo')
        .optional()
        .isIn(['SALA', 'ESCRITORIO', 'CONSULTORIO']).withMessage('Tipo inválido'),

    body('capacidad')
        .optional()
        .isInt({ min: 1 }).withMessage('La capacidad debe ser mayor a 0')
        .toInt(),

    body('activo')
        .optional()
        .isBoolean().withMessage('El campo activo debe ser booleano')
];

/**
 * Reglas para buscar recursos disponibles
 */
const findAvailableRules = [
    query('startTime')
        .notEmpty().withMessage('startTime es requerido')
        .isISO8601().withMessage('startTime debe ser una fecha ISO 8601 válida'),

    query('endTime')
        .notEmpty().withMessage('endTime es requerido')
        .isISO8601().withMessage('endTime debe ser una fecha ISO 8601 válida'),

    query('tipo')
        .optional()
        .isIn(['SALA', 'ESCRITORIO', 'CONSULTORIO']).withMessage('Tipo inválido'),

    query('capacidadMin')
        .optional()
        .isInt({ min: 1 }).withMessage('capacidadMin debe ser mayor a 0')
        .toInt()
];

/**
 * Reglas para param ID
 */
const idParamRules = [
    param('id')
        .isUUID().withMessage('ID de recurso inválido')
];

module.exports = {
    createResourceRules,
    updateResourceRules,
    findAvailableRules,
    idParamRules
};
