/**
 * Servicio de Auditoría
 * Registra todas las acciones del sistema
 */

const { AuditLog, User } = require('../models');
const { Op } = require('sequelize');

class AuditService {
    /**
     * Registrar una acción en el log de auditoría
     * @param {Object} logData - Datos del log
     * @returns {Promise<AuditLog>}
     */
    async log(logData) {
        const {
            userId,
            action,
            entityType,
            entityId,
            oldValues,
            newValues,
            ipAddress,
            userAgent,
            details,
            status = 'SUCCESS'
        } = logData;

        try {
            const auditLog = await AuditLog.create({
                user_id: userId || null,
                action,
                entity_type: entityType,
                entity_id: entityId || null,
                old_values: oldValues || null,
                new_values: newValues || null,
                ip_address: ipAddress || null,
                user_agent: userAgent || null,
                details: details || null,
                status
            });
            return auditLog;
        } catch (error) {
            // No lanzar error para no interrumpir la operación principal
            console.error('Error al registrar audit log:', error.message);
            return null;
        }
    }

    /**
     * Helper para extraer IP del request
     * @param {Request} req - Express request
     * @returns {string}
     */
    getIpFromRequest(req) {
        return req.headers['x-forwarded-for']?.split(',')[0] ||
            req.socket?.remoteAddress ||
            req.ip ||
            'unknown';
    }

    /**
     * Helper para extraer User Agent del request
     * @param {Request} req - Express request
     * @returns {string}
     */
    getUserAgentFromRequest(req) {
        return req.headers['user-agent'] || 'unknown';
    }

    /**
     * Registrar login exitoso
     */
    async logLogin(userId, req) {
        return this.log({
            userId,
            action: 'LOGIN',
            entityType: 'AUTH',
            entityId: userId,
            ipAddress: this.getIpFromRequest(req),
            userAgent: this.getUserAgentFromRequest(req),
            status: 'SUCCESS'
        });
    }

    /**
     * Registrar login fallido
     */
    async logLoginFailed(email, req, reason) {
        return this.log({
            userId: null,
            action: 'LOGIN_FAILED',
            entityType: 'AUTH',
            ipAddress: this.getIpFromRequest(req),
            userAgent: this.getUserAgentFromRequest(req),
            details: `Intento fallido para email: ${email}. Razón: ${reason}`,
            status: 'FAILURE'
        });
    }

    /**
     * Registrar creación de entidad
     */
    async logCreate(userId, entityType, entityId, newValues, req) {
        return this.log({
            userId,
            action: 'CREATE',
            entityType,
            entityId,
            newValues: this.sanitizeValues(newValues),
            ipAddress: this.getIpFromRequest(req),
            userAgent: this.getUserAgentFromRequest(req)
        });
    }

    /**
     * Registrar actualización de entidad
     */
    async logUpdate(userId, entityType, entityId, oldValues, newValues, req) {
        return this.log({
            userId,
            action: 'UPDATE',
            entityType,
            entityId,
            oldValues: this.sanitizeValues(oldValues),
            newValues: this.sanitizeValues(newValues),
            ipAddress: this.getIpFromRequest(req),
            userAgent: this.getUserAgentFromRequest(req)
        });
    }

    /**
     * Registrar eliminación de entidad
     */
    async logDelete(userId, entityType, entityId, oldValues, req) {
        return this.log({
            userId,
            action: 'DELETE',
            entityType,
            entityId,
            oldValues: this.sanitizeValues(oldValues),
            ipAddress: this.getIpFromRequest(req),
            userAgent: this.getUserAgentFromRequest(req)
        });
    }

    /**
     * Registrar cancelación de reserva
     */
    async logCancel(userId, entityId, req) {
        return this.log({
            userId,
            action: 'CANCEL',
            entityType: 'RESERVATION',
            entityId,
            ipAddress: this.getIpFromRequest(req),
            userAgent: this.getUserAgentFromRequest(req)
        });
    }

    /**
     * Registrar confirmación de reserva
     */
    async logConfirm(userId, entityId, req) {
        return this.log({
            userId,
            action: 'CONFIRM',
            entityType: 'RESERVATION',
            entityId,
            ipAddress: this.getIpFromRequest(req),
            userAgent: this.getUserAgentFromRequest(req)
        });
    }

    /**
     * Sanitizar valores para no guardar datos sensibles
     */
    sanitizeValues(values) {
        if (!values) return null;

        const sanitized = { ...values };
        // Eliminar campos sensibles
        delete sanitized.password;
        delete sanitized.token;
        delete sanitized.refreshToken;

        return sanitized;
    }

    /**
     * Obtener logs de un usuario
     */
    async getByUser(userId, options = {}) {
        const { page = 1, limit = 20, action, startDate, endDate } = options;
        const offset = (page - 1) * limit;

        const where = { user_id: userId };

        if (action) {
            where.action = action;
        }

        if (startDate && endDate) {
            where.created_at = {
                [Op.between]: [startDate, endDate]
            };
        }

        const { count, rows } = await AuditLog.findAndCountAll({
            where,
            limit,
            offset,
            order: [['created_at', 'DESC']]
        });

        return {
            logs: rows,
            total: count,
            page,
            totalPages: Math.ceil(count / limit)
        };
    }

    /**
     * Obtener logs de una entidad
     */
    async getByEntity(entityType, entityId, options = {}) {
        const { page = 1, limit = 20 } = options;
        const offset = (page - 1) * limit;

        const { count, rows } = await AuditLog.findAndCountAll({
            where: {
                entity_type: entityType,
                entity_id: entityId
            },
            limit,
            offset,
            order: [['created_at', 'DESC']],
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'nombre', 'email']
            }]
        });

        return {
            logs: rows,
            total: count,
            page,
            totalPages: Math.ceil(count / limit)
        };
    }

    /**
     * Buscar logs con filtros avanzados
     */
    async search(filters = {}) {
        const {
            page = 1,
            limit = 20,
            userId,
            action,
            entityType,
            status,
            startDate,
            endDate,
            ipAddress
        } = filters;
        const offset = (page - 1) * limit;

        const where = {};

        if (userId) where.user_id = userId;
        if (action) where.action = action;
        if (entityType) where.entity_type = entityType;
        if (status) where.status = status;
        if (ipAddress) where.ip_address = { [Op.like]: `%${ipAddress}%` };

        if (startDate && endDate) {
            where.created_at = { [Op.between]: [startDate, endDate] };
        }

        const { count, rows } = await AuditLog.findAndCountAll({
            where,
            limit,
            offset,
            order: [['created_at', 'DESC']],
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'nombre', 'email']
            }]
        });

        return {
            logs: rows,
            total: count,
            page,
            totalPages: Math.ceil(count / limit)
        };
    }
}

module.exports = new AuditService();
