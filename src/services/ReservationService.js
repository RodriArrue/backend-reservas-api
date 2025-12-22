const { Reservation, User, Resource } = require('../models');
const { Op } = require('sequelize');

/**
 * Clase de error personalizada para el servicio de reservas
 */
class ReservationServiceError extends Error {
    constructor(message, code) {
        super(message);
        this.code = code;
        this.name = 'ReservationServiceError';
    }
}

// Configuración de tiempo mínimo de cancelación (en horas)
const MIN_CANCELLATION_HOURS = 2;

class ReservationService {
    /**
     * Crear una nueva reserva
     * @param {Object} reservationData - Datos de la reserva
     * @returns {Promise<Reservation>}
     */
    async create(reservationData) {
        // Verificar que el recurso existe y está activo
        const resource = await Resource.findByPk(reservationData.resource_id);
        if (!resource) {
            throw new ReservationServiceError('Recurso no encontrado', 'RESOURCE_NOT_FOUND');
        }
        if (!resource.activo) {
            throw new ReservationServiceError('El recurso no está disponible', 'RESOURCE_INACTIVE');
        }

        // Verificar que no hay conflictos de horario
        const hasConflict = await this.checkConflict(
            reservationData.resource_id,
            reservationData.start_time,
            reservationData.end_time
        );

        if (hasConflict) {
            throw new ReservationServiceError('El recurso ya está reservado en ese horario', 'SCHEDULE_CONFLICT');
        }

        const reservation = await Reservation.create(reservationData);

        // Retornar con relaciones cargadas
        return this.findById(reservation.id);
    }

    /**
     * Verificar conflictos de horario
     * @param {string} resourceId - ID del recurso
     * @param {Date} startTime - Inicio de la reserva
     * @param {Date} endTime - Fin de la reserva
     * @param {string} excludeId - ID de reserva a excluir (para updates)
     * @returns {Promise<boolean>}
     */
    async checkConflict(resourceId, startTime, endTime, excludeId = null) {
        const where = {
            resource_id: resourceId,
            status: { [Op.ne]: 'CANCELLED' },
            [Op.or]: [
                {
                    start_time: { [Op.lt]: endTime },
                    end_time: { [Op.gt]: startTime }
                }
            ]
        };

        if (excludeId) {
            where.id = { [Op.ne]: excludeId };
        }

        const conflictingReservation = await Reservation.findOne({ where });
        return !!conflictingReservation;
    }

    /**
     * Obtener todas las reservas
     * @param {Object} options - Opciones de filtrado y paginación
     * @returns {Promise<{reservations: Reservation[], total: number}>}
     */
    async findAll(options = {}) {
        const {
            page = 1,
            limit = 10,
            userId,
            resourceId,
            status,
            startDate,
            endDate
        } = options;
        const offset = (page - 1) * limit;

        const where = {};

        if (userId) {
            where.user_id = userId;
        }

        if (resourceId) {
            where.resource_id = resourceId;
        }

        if (status) {
            where.status = status;
        }

        if (startDate && endDate) {
            where.start_time = {
                [Op.gte]: startDate,
                [Op.lte]: endDate
            };
        } else if (startDate) {
            where.start_time = { [Op.gte]: startDate };
        } else if (endDate) {
            where.start_time = { [Op.lte]: endDate };
        }

        const { count, rows } = await Reservation.findAndCountAll({
            where,
            limit,
            offset,
            include: [
                { model: User, as: 'user', attributes: ['id', 'nombre', 'email'] },
                { model: Resource, as: 'resource', attributes: ['id', 'nombre', 'tipo', 'capacidad'] }
            ],
            order: [['start_time', 'ASC']]
        });

        return {
            reservations: rows,
            total: count,
            page,
            totalPages: Math.ceil(count / limit)
        };
    }

    /**
     * Obtener una reserva por ID
     * @param {string} id - ID de la reserva
     * @returns {Promise<Reservation|null>}
     */
    async findById(id) {
        const reservation = await Reservation.findByPk(id, {
            include: [
                { model: User, as: 'user', attributes: ['id', 'nombre', 'email'] },
                { model: Resource, as: 'resource', attributes: ['id', 'nombre', 'tipo', 'capacidad'] }
            ]
        });
        return reservation;
    }

    /**
     * Obtener reservas de un usuario
     * @param {string} userId - ID del usuario
     * @param {Object} options - Opciones de filtrado
     * @returns {Promise<Reservation[]>}
     */
    async findByUser(userId, options = {}) {
        const { status, upcoming = false } = options;

        const where = { user_id: userId };

        if (status) {
            where.status = status;
        }

        if (upcoming) {
            where.start_time = { [Op.gte]: new Date() };
            where.status = { [Op.ne]: 'CANCELLED' };
        }

        const reservations = await Reservation.findAll({
            where,
            include: [
                { model: Resource, as: 'resource', attributes: ['id', 'nombre', 'tipo', 'capacidad'] }
            ],
            order: [['start_time', 'ASC']]
        });

        return reservations;
    }

    /**
     * Obtener reservas de un recurso
     * @param {string} resourceId - ID del recurso
     * @param {Object} options - Opciones de filtrado
     * @returns {Promise<Reservation[]>}
     */
    async findByResource(resourceId, options = {}) {
        const { startDate, endDate, status } = options;

        const where = { resource_id: resourceId };

        if (status) {
            where.status = status;
        } else {
            where.status = { [Op.ne]: 'CANCELLED' };
        }

        if (startDate && endDate) {
            where[Op.or] = [
                {
                    start_time: { [Op.gte]: startDate, [Op.lte]: endDate }
                },
                {
                    end_time: { [Op.gte]: startDate, [Op.lte]: endDate }
                },
                {
                    start_time: { [Op.lte]: startDate },
                    end_time: { [Op.gte]: endDate }
                }
            ];
        }

        const reservations = await Reservation.findAll({
            where,
            include: [
                { model: User, as: 'user', attributes: ['id', 'nombre', 'email'] }
            ],
            order: [['start_time', 'ASC']]
        });

        return reservations;
    }

    /**
     * Actualizar una reserva
     * @param {string} id - ID de la reserva
     * @param {Object} updateData - Datos a actualizar
     * @returns {Promise<Reservation|null>}
     */
    async update(id, updateData) {
        const reservation = await Reservation.findByPk(id);

        if (!reservation) {
            return null;
        }

        // No permitir modificar reservas canceladas (excepto para el status change interno)
        if (reservation.status === 'CANCELLED' && !updateData._internalStatusChange) {
            throw new ReservationServiceError(
                'No se puede modificar una reserva cancelada',
                'CANNOT_MODIFY_CANCELLED'
            );
        }

        // Si se están cambiando los tiempos, verificar conflictos
        if (updateData.start_time || updateData.end_time) {
            const startTime = updateData.start_time || reservation.start_time;
            const endTime = updateData.end_time || reservation.end_time;
            const resourceId = updateData.resource_id || reservation.resource_id;

            const hasConflict = await this.checkConflict(resourceId, startTime, endTime, id);

            if (hasConflict) {
                throw new ReservationServiceError(
                    'El recurso ya está reservado en ese horario',
                    'SCHEDULE_CONFLICT'
                );
            }
        }

        // Limpiar flag interno antes de actualizar
        delete updateData._internalStatusChange;

        await reservation.update(updateData);
        return this.findById(id);
    }

    /**
     * Eliminar una reserva (soft delete)
     * @param {string} id - ID de la reserva
     * @returns {Promise<boolean>}
     */
    async delete(id) {
        const reservation = await Reservation.findByPk(id);

        if (!reservation) {
            return false;
        }

        await reservation.destroy();
        return true;
    }

    /**
     * Cancelar una reserva con validaciones de negocio
     * @param {string} id - ID de la reserva
     * @param {string} userId - ID del usuario que cancela
     * @param {string} userRole - Rol del usuario (ADMIN/USER)
     * @returns {Promise<Reservation|null>}
     */
    async cancel(id, userId, userRole) {
        const reservation = await Reservation.findByPk(id);

        if (!reservation) {
            return null;
        }

        // No se puede cancelar si ya está cancelada
        if (reservation.status === 'CANCELLED') {
            throw new ReservationServiceError(
                'La reserva ya está cancelada',
                'ALREADY_CANCELLED'
            );
        }

        // Solo el dueño o ADMIN puede cancelar
        if (reservation.user_id !== userId && userRole !== 'ADMIN') {
            throw new ReservationServiceError(
                'No tienes permiso para cancelar esta reserva',
                'FORBIDDEN'
            );
        }

        // No se puede cancelar si ya pasó
        const now = new Date();
        if (new Date(reservation.start_time) < now) {
            throw new ReservationServiceError(
                'No se puede cancelar una reserva que ya comenzó o pasó',
                'RESERVATION_PAST'
            );
        }

        // Tiempo mínimo de anticipación
        const minCancelTime = new Date(reservation.start_time);
        minCancelTime.setHours(minCancelTime.getHours() - MIN_CANCELLATION_HOURS);
        if (now > minCancelTime) {
            throw new ReservationServiceError(
                `Debes cancelar con al menos ${MIN_CANCELLATION_HOURS} horas de anticipación`,
                'CANCELLATION_TOO_LATE'
            );
        }

        return this.update(id, { status: 'CANCELLED', _internalStatusChange: true });
    }

    /**
     * Confirmar una reserva (solo desde PENDING)
     * @param {string} id - ID de la reserva
     * @returns {Promise<Reservation|null>}
     */
    async confirm(id) {
        const reservation = await Reservation.findByPk(id);

        if (!reservation) {
            return null;
        }

        // Solo se pueden confirmar reservas PENDING
        if (reservation.status !== 'PENDING') {
            throw new ReservationServiceError(
                `Solo se pueden confirmar reservas en estado PENDING. Estado actual: ${reservation.status}`,
                'INVALID_STATE_TRANSITION'
            );
        }

        return this.update(id, { status: 'CONFIRMED', _internalStatusChange: true });
    }

    /**
     * Restaurar una reserva eliminada
     * @param {string} id - ID de la reserva
     * @returns {Promise<Reservation|null>}
     */
    async restore(id) {
        const reservation = await Reservation.findByPk(id, { paranoid: false });

        if (!reservation) {
            return null;
        }

        await reservation.restore();
        return this.findById(id);
    }

    /**
     * Obtener reservas del día actual
     * @param {Object} filters - Filtros adicionales
     * @returns {Promise<Reservation[]>}
     */
    async findToday(filters = {}) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const where = {
            start_time: { [Op.gte]: today, [Op.lt]: tomorrow },
            status: { [Op.ne]: 'CANCELLED' }
        };

        if (filters.resourceId) {
            where.resource_id = filters.resourceId;
        }

        if (filters.userId) {
            where.user_id = filters.userId;
        }

        const reservations = await Reservation.findAll({
            where,
            include: [
                { model: User, as: 'user', attributes: ['id', 'nombre', 'email'] },
                { model: Resource, as: 'resource', attributes: ['id', 'nombre', 'tipo', 'capacidad'] }
            ],
            order: [['start_time', 'ASC']]
        });

        return reservations;
    }

    /**
     * Obtener estadísticas de reservas
     * @param {Object} options - Opciones de filtrado
     * @returns {Promise<Object>}
     */
    async getStats(options = {}) {
        const { startDate, endDate, resourceId, userId } = options;

        const where = {};

        if (startDate && endDate) {
            where.start_time = { [Op.gte]: startDate, [Op.lte]: endDate };
        }

        if (resourceId) {
            where.resource_id = resourceId;
        }

        if (userId) {
            where.user_id = userId;
        }

        const total = await Reservation.count({ where });

        const pending = await Reservation.count({
            where: { ...where, status: 'PENDING' }
        });

        const confirmed = await Reservation.count({
            where: { ...where, status: 'CONFIRMED' }
        });

        const cancelled = await Reservation.count({
            where: { ...where, status: 'CANCELLED' }
        });

        return {
            total,
            pending,
            confirmed,
            cancelled
        };
    }
}

module.exports = {
    ReservationService: new ReservationService(),
    ReservationServiceError
};
