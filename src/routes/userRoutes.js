const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const authMiddleware = require('../middlewares/authMiddleware');
const { requirePermission } = require('../middlewares/roleMiddleware');
const { validate } = require('../middlewares/validate');
const { uuidParamSchema, createUserSchema, getUsersQuerySchema, updateUserSchema } = require('../validators/user.schema');
const { csrfMiddleware } = require('../middlewares/csrfMiddleware');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas de lectura (requieren permiso 'read' sobre 'users')
router.get('/', requirePermission('users', 'read'), validate({ query: getUsersQuerySchema }), UserController.findAll);
router.get('/:id', requirePermission('users', 'read'), validate({ params: uuidParamSchema }), UserController.findById);

// Crear usuario (requiere permiso 'create' sobre 'users' + CSRF)
router.post('/', csrfMiddleware, requirePermission('users', 'create'), validate({ body: createUserSchema }), UserController.create);

// Actualizar usuario (requiere permiso 'update' sobre 'users' + CSRF)
router.put('/:id', csrfMiddleware, requirePermission('users', 'update'), validate({ params: uuidParamSchema, body: updateUserSchema }), UserController.update);

// Eliminar usuario (soft delete, requiere permiso 'delete' sobre 'users' + CSRF)
router.delete('/:id', csrfMiddleware, requirePermission('users', 'delete'), validate({ params: uuidParamSchema }), UserController.delete);

// Restaurar usuario eliminado (requiere permiso 'update' sobre 'users' + CSRF)
router.patch('/:id/restore', csrfMiddleware, requirePermission('users', 'update'), validate({ params: uuidParamSchema }), UserController.restore);

// Desactivar usuario (requiere permiso 'delete' sobre 'users' + CSRF)
router.patch('/:id/deactivate', csrfMiddleware, requirePermission('users', 'delete'), validate({ params: uuidParamSchema }), UserController.deactivate);

// Reactivar usuario (requiere permiso 'update' sobre 'users' + CSRF)
router.patch('/:id/reactivate', csrfMiddleware, requirePermission('users', 'update'), validate({ params: uuidParamSchema }), UserController.reactivate);

module.exports = router;
