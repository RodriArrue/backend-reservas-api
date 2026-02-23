const express = require('express');
const router = express.Router();
const { ResourceController } = require('../controllers');
const { authMiddleware, csrfMiddleware, requireAdmin, createLimiter } = require('../middlewares');
const {
    createResourceRules,
    updateResourceRules,
    findAvailableRules,
    idParamRules,
    validate
} = require('../validators');

/**
 * @route   POST /api/resources
 * @desc    Crear un nuevo recurso (requiere ADMIN, CSRF)
 */
router.post('/',
    authMiddleware,
    requireAdmin,
    csrfMiddleware,
    createLimiter,
    createResourceRules,
    validate,
    ResourceController.create
);

/**
 * @route   GET /api/resources
 * @desc    Obtener todos los recursos (con paginación y filtros)
 * @query   page, limit, tipo, activo, capacidadMin, search
 */
router.get('/', ResourceController.findAll);

/**
 * @route   GET /api/resources/available
 * @desc    Obtener recursos disponibles en un rango de tiempo
 * @query   startTime, endTime, tipo, capacidadMin
 */
router.get('/available', findAvailableRules, validate, ResourceController.findAvailable);

/**
 * @route   GET /api/resources/type/:tipo
 * @desc    Obtener recursos por tipo
 */
router.get('/type/:tipo', ResourceController.findByType);

/**
 * @route   GET /api/resources/:id
 * @desc    Obtener un recurso por ID
 */
router.get('/:id', idParamRules, validate, ResourceController.findById);

/**
 * @route   GET /api/resources/:id/reservations
 * @desc    Obtener un recurso con sus reservas
 */
router.get('/:id/reservations', idParamRules, validate, ResourceController.findByIdWithReservations);

/**
 * @route   PUT /api/resources/:id
 * @desc    Actualizar un recurso (requiere ADMIN, CSRF)
 */
router.put('/:id',
    authMiddleware,
    requireAdmin,
    csrfMiddleware,
    updateResourceRules,
    validate,
    ResourceController.update
);

/**
 * @route   DELETE /api/resources/:id
 * @desc    Eliminar un recurso (soft delete, requiere ADMIN, CSRF)
 */
router.delete('/:id', authMiddleware, requireAdmin, csrfMiddleware, idParamRules, validate, ResourceController.delete);

/**
 * @route   POST /api/resources/:id/restore
 * @desc    Restaurar un recurso eliminado (requiere ADMIN, CSRF)
 */
router.post('/:id/restore', authMiddleware, requireAdmin, csrfMiddleware, idParamRules, validate, ResourceController.restore);

/**
 * @route   PATCH /api/resources/:id/toggle-active
 * @desc    Activar/Desactivar un recurso (requiere ADMIN, CSRF)
 */
router.patch('/:id/toggle-active', authMiddleware, requireAdmin, csrfMiddleware, idParamRules, validate, ResourceController.toggleActive);

module.exports = router;
