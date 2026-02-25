const express = require('express');
const router = express.Router();
const PermissionController = require('../controllers/PermissionController');
const authMiddleware = require('../middlewares/authMiddleware');
const { requirePermission } = require('../middlewares/roleMiddleware');
const { validate } = require('../middlewares/validate');
const {
    uuidParamSchema,
    roleIdParamSchema,
    createPermissionSchema,
    updatePermissionSchema,
    assignPermissionSchema,
    bulkAssignSchema,
    getPermissionsQuerySchema,
} = require('../validators/permission.schema');
const { csrfMiddleware } = require('../middlewares/csrfMiddleware');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas de lectura (requieren permiso 'read' sobre 'permissions')
router.get('/', requirePermission('permissions', 'read'), validate({ query: getPermissionsQuerySchema }), PermissionController.getAll);
router.get('/role/:roleId', requirePermission('permissions', 'read'), validate({ params: roleIdParamSchema }), PermissionController.getRolePermissions);
router.get('/:id', requirePermission('permissions', 'read'), validate({ params: uuidParamSchema }), PermissionController.getById);

// Rutas de escritura (requieren permisos específicos + CSRF)
router.post('/', csrfMiddleware, requirePermission('permissions', 'create'), validate({ body: createPermissionSchema }), PermissionController.create);
router.put('/:id', csrfMiddleware, requirePermission('permissions', 'update'), validate({ params: uuidParamSchema, body: updatePermissionSchema }), PermissionController.update);
router.delete('/:id', csrfMiddleware, requirePermission('permissions', 'delete'), validate({ params: uuidParamSchema }), PermissionController.delete);

// Rutas de asignación (requieren permiso 'manage' sobre 'roles' + CSRF)
router.post('/assign', csrfMiddleware, requirePermission('roles', 'manage'), validate({ body: assignPermissionSchema }), PermissionController.assignToRole);
router.post('/remove', csrfMiddleware, requirePermission('roles', 'manage'), validate({ body: assignPermissionSchema }), PermissionController.removeFromRole);
router.post('/role/:roleId/bulk', csrfMiddleware, requirePermission('roles', 'manage'), validate({ params: roleIdParamSchema, body: bulkAssignSchema }), PermissionController.assignBulkToRole);

module.exports = router;
