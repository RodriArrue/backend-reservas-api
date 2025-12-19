const express = require('express');
const router = express.Router();
const { ReservationController } = require('../controllers');

/**
 * @route   POST /api/reservations
 * @desc    Crear una nueva reserva
 */
router.post('/', ReservationController.create);

/**
 * @route   GET /api/reservations
 * @desc    Obtener todas las reservas (con paginación y filtros)
 * @query   page, limit, userId, resourceId, status, startDate, endDate
 */
router.get('/', ReservationController.findAll);

/**
 * @route   GET /api/reservations/today
 * @desc    Obtener las reservas de hoy
 * @query   resourceId, userId
 */
router.get('/today', ReservationController.findToday);

/**
 * @route   GET /api/reservations/stats
 * @desc    Obtener estadísticas de reservas
 * @query   startDate, endDate, resourceId, userId
 */
router.get('/stats', ReservationController.getStats);

/**
 * @route   GET /api/reservations/user/:userId
 * @desc    Obtener reservas de un usuario
 * @query   status, upcoming
 */
router.get('/user/:userId', ReservationController.findByUser);

/**
 * @route   GET /api/reservations/resource/:resourceId
 * @desc    Obtener reservas de un recurso
 * @query   startDate, endDate, status
 */
router.get('/resource/:resourceId', ReservationController.findByResource);

/**
 * @route   GET /api/reservations/:id
 * @desc    Obtener una reserva por ID
 */
router.get('/:id', ReservationController.findById);

/**
 * @route   PUT /api/reservations/:id
 * @desc    Actualizar una reserva
 */
router.put('/:id', ReservationController.update);

/**
 * @route   DELETE /api/reservations/:id
 * @desc    Eliminar una reserva (soft delete)
 */
router.delete('/:id', ReservationController.delete);

/**
 * @route   POST /api/reservations/:id/cancel
 * @desc    Cancelar una reserva
 */
router.post('/:id/cancel', ReservationController.cancel);

/**
 * @route   POST /api/reservations/:id/confirm
 * @desc    Confirmar una reserva
 */
router.post('/:id/confirm', ReservationController.confirm);

/**
 * @route   POST /api/reservations/:id/restore
 * @desc    Restaurar una reserva eliminada
 */
router.post('/:id/restore', ReservationController.restore);

module.exports = router;
