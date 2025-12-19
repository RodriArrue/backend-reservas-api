const express = require('express');
const router = express.Router();
const { UserController } = require('../controllers');

/**
 * @route   POST /api/users
 * @desc    Crear un nuevo usuario
 */
router.post('/', UserController.create);

/**
 * @route   GET /api/users
 * @desc    Obtener todos los usuarios (con paginación y filtros)
 * @query   page, limit, rol, activo, search
 */
router.get('/', UserController.findAll);

/**
 * @route   GET /api/users/:id
 * @desc    Obtener un usuario por ID
 */
router.get('/:id', UserController.findById);

/**
 * @route   PUT /api/users/:id
 * @desc    Actualizar un usuario
 */
router.put('/:id', UserController.update);

/**
 * @route   DELETE /api/users/:id
 * @desc    Eliminar un usuario (soft delete)
 */
router.delete('/:id', UserController.delete);

/**
 * @route   POST /api/users/:id/restore
 * @desc    Restaurar un usuario eliminado
 */
router.post('/:id/restore', UserController.restore);

/**
 * @route   POST /api/users/login
 * @desc    Login de usuario
 */
router.post('/login', UserController.login);

/**
 * @route   PATCH /api/users/:id/toggle-active
 * @desc    Activar/Desactivar un usuario
 */
router.patch('/:id/toggle-active', UserController.toggleActive);

/**
 * @route   PATCH /api/users/:id/change-role
 * @desc    Cambiar rol de un usuario
 */
router.patch('/:id/change-role', UserController.changeRole);

module.exports = router;
