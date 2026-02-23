const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const { authMiddleware, authLimiter } = require('../middlewares');
const { registerRules, loginRules, validate } = require('../validators');
const { body } = require('express-validator');

/**
 * @route   POST /api/auth/register
 * @desc    Registrar un nuevo usuario
 * @access  Público (con rate limiting)
 */
router.post('/register', authLimiter, registerRules, validate, AuthController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login de usuario
 * @access  Público (con rate limiting)
 */
router.post('/login', authLimiter, loginRules, validate, AuthController.login);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refrescar access token con refresh token
 * @access  Público
 */
router.post('/refresh',
    body('refreshToken').notEmpty().withMessage('Refresh token requerido'),
    validate,
    AuthController.refresh
);

/**
 * @route   POST /api/auth/logout
 * @desc    Cerrar sesión actual (invalidar tokens)
 * @access  Público (pero requiere tokens para invalidar)
 */
router.post('/logout', AuthController.logout);

/**
 * @route   POST /api/auth/logout-all
 * @desc    Cerrar todas las sesiones del usuario
 * @access  Privado (requiere autenticación)
 */
router.post('/logout-all', authMiddleware, AuthController.logoutAll);

/**
 * @route   GET /api/auth/me
 * @desc    Obtener perfil del usuario autenticado
 * @access  Privado (requiere token)
 */
router.get('/me', authMiddleware, AuthController.me);

module.exports = router;

