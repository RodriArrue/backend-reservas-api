const express = require('express');
const router = express.Router();
const { ResourceController } = require('../controllers');

/**
 * @route   POST /api/resources
 * @desc    Crear un nuevo recurso
 */
router.post('/', ResourceController.create);

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
router.get('/available', ResourceController.findAvailable);

/**
 * @route   GET /api/resources/type/:tipo
 * @desc    Obtener recursos por tipo
 */
router.get('/type/:tipo', ResourceController.findByType);

/**
 * @route   GET /api/resources/:id
 * @desc    Obtener un recurso por ID
 */
router.get('/:id', ResourceController.findById);

/**
 * @route   GET /api/resources/:id/reservations
 * @desc    Obtener un recurso con sus reservas
 */
router.get('/:id/reservations', ResourceController.findByIdWithReservations);

/**
 * @route   PUT /api/resources/:id
 * @desc    Actualizar un recurso
 */
router.put('/:id', ResourceController.update);

/**
 * @route   DELETE /api/resources/:id
 * @desc    Eliminar un recurso (soft delete)
 */
router.delete('/:id', ResourceController.delete);

/**
 * @route   POST /api/resources/:id/restore
 * @desc    Restaurar un recurso eliminado
 */
router.post('/:id/restore', ResourceController.restore);

/**
 * @route   PATCH /api/resources/:id/toggle-active
 * @desc    Activar/Desactivar un recurso
 */
router.patch('/:id/toggle-active', ResourceController.toggleActive);

module.exports = router;
