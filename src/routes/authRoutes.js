const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const { authMiddleware, authLimiter } = require('../middlewares');
const { registerRules, loginRules, validate } = require('../validators');

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
 * @route   GET /api/auth/me
 * @desc    Obtener perfil del usuario autenticado
 * @access  Privado (requiere token)
 */
router.get('/me', authMiddleware, AuthController.me);

module.exports = router;
