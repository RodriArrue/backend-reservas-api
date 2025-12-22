const express = require('express');
const router = express.Router();
const { ReservationController } = require('../controllers');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * @route   POST /api/reservations
 * @desc    Crear una nueva reserva (requiere autenticación)
 */
router.post('/', authMiddleware, ReservationController.create);

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
 * @desc    Actualizar una reserva (requiere autenticación)
 */
router.put('/:id', authMiddleware, ReservationController.update);

/**
 * @route   DELETE /api/reservations/:id
 * @desc    Eliminar una reserva (soft delete, requiere autenticación)
 */
router.delete('/:id', authMiddleware, ReservationController.delete);

/**
 * @route   POST /api/reservations/:id/cancel
 * @desc    Cancelar una reserva (requiere autenticación, solo dueño o ADMIN)
 */
router.post('/:id/cancel', authMiddleware, ReservationController.cancel);

/**
 * @route   POST /api/reservations/:id/confirm
 * @desc    Confirmar una reserva (requiere autenticación)
 */
router.post('/:id/confirm', authMiddleware, ReservationController.confirm);

/**
 * @route   POST /api/reservations/:id/restore
 * @desc    Restaurar una reserva eliminada (requiere autenticación)
 */
router.post('/:id/restore', authMiddleware, ReservationController.restore);

module.exports = router;

