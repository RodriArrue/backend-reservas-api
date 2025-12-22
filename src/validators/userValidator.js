/**
 * Validadores para User
 */

const { body, param } = require('express-validator');

/**
 * Reglas para registro de usuario
 */
const registerRules = [
    body('nombre')
        .trim()
        .notEmpty().withMessage('El nombre es requerido')
        .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres')
        .escape(),

    body('email')
        .trim()
        .notEmpty().withMessage('El email es requerido')
        .isEmail().withMessage('Email inválido')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('La contraseña es requerida')
        .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
        .matches(/\d/).withMessage('La contraseña debe contener al menos un número'),

    body('rol')
        .optional()
        .isIn(['ADMIN', 'USER']).withMessage('Rol inválido')
];

/**
 * Reglas para login
 */
const loginRules = [
    body('email')
        .trim()
        .notEmpty().withMessage('El email es requerido')
        .isEmail().withMessage('Email inválido')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('La contraseña es requerida')
];

/**
 * Reglas para actualizar usuario
 */
const updateUserRules = [
    param('id')
        .isUUID().withMessage('ID de usuario inválido'),

    body('nombre')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres')
        .escape(),

    body('email')
        .optional()
        .trim()
        .isEmail().withMessage('Email inválido')
        .normalizeEmail(),

    body('activo')
        .optional()
        .isBoolean().withMessage('El campo activo debe ser booleano')
];

module.exports = {
    registerRules,
    loginRules,
    updateUserRules
};
