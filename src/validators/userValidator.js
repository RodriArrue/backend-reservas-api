/**
 * Validadores para User
 */

const { body, param } = require('express-validator');

/**
 * Mensaje detallado de requisitos de contraseña
 */
const PASSWORD_REQUIREMENTS = 'La contraseña debe tener: mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 símbolo (@$!%*?&#)';

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
        .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
        .matches(/[A-Z]/).withMessage('La contraseña debe contener al menos una mayúscula')
        .matches(/[a-z]/).withMessage('La contraseña debe contener al menos una minúscula')
        .matches(/[0-9]/).withMessage('La contraseña debe contener al menos un número')
        .matches(/[@$!%*?&#]/).withMessage('La contraseña debe contener al menos un símbolo (@$!%*?&#)'),

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
