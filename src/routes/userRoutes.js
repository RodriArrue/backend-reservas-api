const express = require('express');
const router = express.Router();
const { UserController } = require('../controllers');
const { authMiddleware, requireAdmin, csrfMiddleware } = require('../middlewares');

/**
 * @route   POST /api/users
 * @desc    Crear un nuevo usuario (requiere ADMIN, CSRF)
 * @access  Privado - Solo ADMIN
 */
router.post('/', authMiddleware, requireAdmin, csrfMiddleware, UserController.create);

/**
 * @route   GET /api/users
 * @desc    Obtener todos los usuarios (con paginación y filtros)
 * @query   page, limit, rol, activo, search
 * @access  Privado - Requiere autenticación
 */
router.get('/', authMiddleware, UserController.findAll);

/**
 * @route   GET /api/users/:id
 * @desc    Obtener un usuario por ID
 * @access  Privado - Requiere autenticación
 */
router.get('/:id', authMiddleware, UserController.findById);

/**
 * @route   PUT /api/users/:id
 * @desc    Actualizar un usuario (requiere ADMIN, CSRF)
 * @access  Privado - Solo ADMIN
 */
router.put('/:id', authMiddleware, requireAdmin, csrfMiddleware, UserController.update);

/**
 * @route   DELETE /api/users/:id
 * @desc    Eliminar un usuario (soft delete, requiere ADMIN, CSRF)
 * @access  Privado - Solo ADMIN
 */
router.delete('/:id', authMiddleware, requireAdmin, csrfMiddleware, UserController.delete);

/**
 * @route   POST /api/users/:id/restore
 * @desc    Restaurar un usuario eliminado (requiere ADMIN, CSRF)
 * @access  Privado - Solo ADMIN
 */
router.post('/:id/restore', authMiddleware, requireAdmin, csrfMiddleware, UserController.restore);

/**
 * @route   POST /api/users/login
 * @desc    Login de usuario (deprecado, usar /api/auth/login)
 * @access  Público
 */
router.post('/login', UserController.login);

/**
 * @route   PATCH /api/users/:id/toggle-active
 * @desc    Activar/Desactivar un usuario (requiere ADMIN, CSRF)
 * @access  Privado - Solo ADMIN
 */
router.patch('/:id/toggle-active', authMiddleware, requireAdmin, csrfMiddleware, UserController.toggleActive);

/**
 * @route   PATCH /api/users/:id/change-role
 * @desc    Cambiar rol de un usuario (requiere ADMIN, CSRF)
 * @access  Privado - Solo ADMIN
 */
router.patch('/:id/change-role', authMiddleware, requireAdmin, csrfMiddleware, UserController.changeRole);

module.exports = router;
