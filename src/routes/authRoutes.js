const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const authMiddleware = require('../middlewares/authMiddleware');
const { authLimiter } = require('../middlewares/rateLimitMiddleware');
const { validate } = require('../middlewares/validate');
const { registerSchema, loginSchema, changePasswordSchema } = require('../validators/auth.schema');

/**
 * @route   POST /api/auth/register
 * @desc    Registrar un nuevo usuario
 * @access  Público (con rate limiting)
 */
router.post('/register', authLimiter, validate({ body: registerSchema }), AuthController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login de usuario
 * @access  Público (con rate limiting)
 */
router.post('/login', authLimiter, validate({ body: loginSchema }), AuthController.login);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refrescar access token con refresh token
 * @access  Público
 */
router.post('/refresh', AuthController.refresh);

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
 * @desc    Obtener perfil del usuario autenticado (con roles)
 * @access  Privado (requiere token)
 */
router.get('/me', authMiddleware, AuthController.me);

/**
 * @route   PATCH /api/auth/change-password
 * @desc    Cambiar contraseña del usuario autenticado
 * @access  Privado (requiere token)
 */
router.patch('/change-password', authMiddleware, validate({ body: changePasswordSchema }), AuthController.changePassword);

module.exports = router;
