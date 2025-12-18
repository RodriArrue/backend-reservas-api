const { ReservationService } = require('../services');

class ReservationController {
    async create(req, res) {
        try {
            const reservation = await ReservationService.create(req.body);
            res.status(201).json({
                success: true,
                data: reservation,
                message: 'Reserva creada exitosamente'
            });
        } catch (error) {
            if (error.message === 'El recurso ya está reservado en ese horario') {
                return res.status(409).json({
                    success: false,
                    error: error.message
                });
            }
            res.status(500).json({
                success: false,
                error: 'Error al crear reserva'
            });
        }
    }

    async findAll(req, res) {
        try {
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
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error al obtener reservas'
            });
        }
    }

    async findById(req, res) {
        try {
            const reservation = await ReservationService.findById(req.params.id);
            if (!reservation) {
                return res.status(404).json({
                    success: false,
                    error: 'Reserva no encontrada'
                });
            }
            res.json({
                success: true,
                data: reservation
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error al obtener reserva'
            });
        }
    }

    async findByUser(req, res) {
        try {
            const { status, upcoming } = req.query;
            const reservations = await ReservationService.findByUser(req.params.userId, {
                status,
                upcoming: upcoming === 'true'
            });
            res.json({
                success: true,
                data: reservations
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error al obtener reservas del usuario'
            });
        }
    }

    async findByResource(req, res) {
        try {
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
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error al obtener reservas del recurso'
            });
        }
    }

    async update(req, res) {
        try {
            const reservation = await ReservationService.update(req.params.id, req.body);
            if (!reservation) {
                return res.status(404).json({
                    success: false,
                    error: 'Reserva no encontrada'
                });
            }
            res.json({
                success: true,
                data: reservation,
                message: 'Reserva actualizada exitosamente'
            });
        } catch (error) {
            if (error.message === 'El recurso ya está reservado en ese horario') {
                return res.status(409).json({
                    success: false,
                    error: error.message
                });
            }
            res.status(500).json({
                success: false,
                error: 'Error al actualizar reserva'
            });
        }
    }

    async delete(req, res) {
        try {
            const deleted = await ReservationService.delete(req.params.id);
            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    error: 'Reserva no encontrada'
                });
            }
            res.json({
                success: true,
                message: 'Reserva eliminada exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error al eliminar reserva'
            });
        }
    }

    async cancel(req, res) {
        try {
            const reservation = await ReservationService.cancel(req.params.id);
            if (!reservation) {
                return res.status(404).json({
                    success: false,
                    error: 'Reserva no encontrada'
                });
            }
            res.json({
                success: true,
                data: reservation,
                message: 'Reserva cancelada exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error al cancelar reserva'
            });
        }
    }

    async confirm(req, res) {
        try {
            const reservation = await ReservationService.confirm(req.params.id);
            if (!reservation) {
                return res.status(404).json({
                    success: false,
                    error: 'Reserva no encontrada'
                });
            }
            res.json({
                success: true,
                data: reservation,
                message: 'Reserva confirmada exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error al confirmar reserva'
            });
        }
    }

    async restore(req, res) {
        try {
            const reservation = await ReservationService.restore(req.params.id);
            if (!reservation) {
                return res.status(404).json({
                    success: false,
                    error: 'Reserva no encontrada'
                });
            }
            res.json({
                success: true,
                data: reservation,
                message: 'Reserva restaurada exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error al restaurar reserva'
            });
        }
    }

    async findToday(req, res) {
        try {
            const { resourceId, userId } = req.query;
            const reservations = await ReservationService.findToday({ resourceId, userId });
            res.json({
                success: true,
                data: reservations
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error al obtener reservas de hoy'
            });
        }
    }

    async getStats(req, res) {
        try {
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
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error al obtener estadísticas'
            });
        }
    }
}

module.exports = new ReservationController();
