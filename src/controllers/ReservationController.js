const { ReservationService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const { NotFoundError } = require('../utils/errors');

class ReservationController {
    create = catchAsync(async (req, res) => {
        const reservation = await ReservationService.create(req.body);
        res.status(201).json({
            success: true,
            data: reservation,
            message: 'Reserva creada exitosamente'
        });
    });

    findAll = catchAsync(async (req, res) => {
        const { page, limit, userId, resourceId, status, startDate, endDate } = req.query;
        const result = await ReservationService.findAll({
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10,
            userId,
            resourceId,
            status,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined
        });
        res.json({
            success: true,
            data: result
        });
    });

    findById = catchAsync(async (req, res) => {
        const reservation = await ReservationService.findById(req.params.id);
        if (!reservation) {
            throw new NotFoundError('Reserva');
        }
        res.json({
            success: true,
            data: reservation
        });
    });

    findByUser = catchAsync(async (req, res) => {
        const { status, upcoming } = req.query;
        const reservations = await ReservationService.findByUser(req.params.userId, {
            status,
            upcoming: upcoming === 'true'
        });
        res.json({
            success: true,
            data: reservations
        });
    });

    findByResource = catchAsync(async (req, res) => {
        const { startDate, endDate, status } = req.query;
        const reservations = await ReservationService.findByResource(req.params.resourceId, {
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            status
        });
        res.json({
            success: true,
            data: reservations
        });
    });

    update = catchAsync(async (req, res) => {
        const reservation = await ReservationService.update(req.params.id, req.body);
        if (!reservation) {
            throw new NotFoundError('Reserva');
        }
        res.json({
            success: true,
            data: reservation,
            message: 'Reserva actualizada exitosamente'
        });
    });

    delete = catchAsync(async (req, res) => {
        const deleted = await ReservationService.delete(req.params.id);
        if (!deleted) {
            throw new NotFoundError('Reserva');
        }
        res.json({
            success: true,
            message: 'Reserva eliminada exitosamente'
        });
    });

    cancel = catchAsync(async (req, res) => {
        const reservation = await ReservationService.cancel(
            req.params.id,
            req.user.id,
            req.user.rol
        );
        if (!reservation) {
            throw new NotFoundError('Reserva');
        }
        res.json({
            success: true,
            data: reservation,
            message: 'Reserva cancelada exitosamente'
        });
    });

    confirm = catchAsync(async (req, res) => {
        const reservation = await ReservationService.confirm(req.params.id);
        if (!reservation) {
            throw new NotFoundError('Reserva');
        }
        res.json({
            success: true,
            data: reservation,
            message: 'Reserva confirmada exitosamente'
        });
    });

    restore = catchAsync(async (req, res) => {
        const reservation = await ReservationService.restore(req.params.id);
        if (!reservation) {
            throw new NotFoundError('Reserva');
        }
        res.json({
            success: true,
            data: reservation,
            message: 'Reserva restaurada exitosamente'
        });
    });

    findToday = catchAsync(async (req, res) => {
        const { resourceId, userId } = req.query;
        const reservations = await ReservationService.findToday({ resourceId, userId });
        res.json({
            success: true,
            data: reservations
        });
    });

    getStats = catchAsync(async (req, res) => {
        const { startDate, endDate, resourceId, userId } = req.query;
        const stats = await ReservationService.getStats({
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            resourceId,
            userId
        });
        res.json({
            success: true,
            data: stats
        });
    });
}

module.exports = new ReservationController();
