const { Resource, Reservation } = require('../models');
const { Op } = require('sequelize');

class ResourceService {
    /**
     * Crear un nuevo recurso
     * @param {Object} resourceData - Datos del recurso
     * @returns {Promise<Resource>}
     */
    async create(resourceData) {
        const resource = await Resource.create(resourceData);
        return resource;
    }

    /**
     * Obtener todos los recursos
     * @param {Object} options - Opciones de filtrado y paginación
     * @returns {Promise<{resources: Resource[], total: number}>}
     */
    async findAll(options = {}) {
        const { page = 1, limit = 10, tipo, activo, capacidadMin, search } = options;
        const offset = (page - 1) * limit;

        const where = {};

        if (tipo) {
            where.tipo = tipo;
        }

        if (activo !== undefined) {
            where.activo = activo;
        }

        if (capacidadMin) {
            where.capacidad = { [Op.gte]: capacidadMin };
        }

        if (search) {
            where.nombre = { [Op.iLike]: `%${search}%` };
        }

        const { count, rows } = await Resource.findAndCountAll({
            where,
            limit,
            offset,
            order: [['created_at', 'DESC']]
        });

        return {
            resources: rows,
            total: count,
            page,
            totalPages: Math.ceil(count / limit)
        };
    }

    /**
     * Obtener un recurso por ID
     * @param {string} id - ID del recurso
     * @returns {Promise<Resource|null>}
     */
    async findById(id) {
        const resource = await Resource.findByPk(id);
        return resource;
    }

    /**
     * Obtener un recurso con sus reservas
     * @param {string} id - ID del recurso
     * @returns {Promise<Resource|null>}
     */
    async findByIdWithReservations(id) {
        const resource = await Resource.findByPk(id, {
            include: [{
                model: Reservation,
                as: 'reservations',
                where: { status: { [Op.ne]: 'CANCELLED' } },
                required: false
            }]
        });
        return resource;
    }

    /**
     * Actualizar un recurso
     * @param {string} id - ID del recurso
     * @param {Object} updateData - Datos a actualizar
     * @returns {Promise<Resource|null>}
     */
    async update(id, updateData) {
        const resource = await Resource.findByPk(id);

        if (!resource) {
            return null;
        }

        await resource.update(updateData);
        return resource;
    }

    /**
     * Eliminar un recurso (soft delete)
     * @param {string} id - ID del recurso
     * @returns {Promise<boolean>}
     */
    async delete(id) {
        const resource = await Resource.findByPk(id);

        if (!resource) {
            return false;
        }

        await resource.destroy();
        return true;
    }

    /**
     * Restaurar un recurso eliminado
     * @param {string} id - ID del recurso
     * @returns {Promise<Resource|null>}
     */
    async restore(id) {
        const resource = await Resource.findByPk(id, { paranoid: false });

        if (!resource) {
            return null;
        }

        await resource.restore();
        return resource;
    }

    /**
     * Buscar recursos disponibles en un rango de tiempo
     * @param {Date} startTime - Inicio del rango
     * @param {Date} endTime - Fin del rango
     * @param {Object} filters - Filtros adicionales
     * @returns {Promise<Resource[]>}
     */
    async findAvailable(startTime, endTime, filters = {}) {
        const { tipo, capacidadMin } = filters;

        const where = { activo: true };

        if (tipo) {
            where.tipo = tipo;
        }

        if (capacidadMin) {
            where.capacidad = { [Op.gte]: capacidadMin };
        }

        // Obtener recursos que NO tienen reservas en conflicto
        const resources = await Resource.findAll({
            where,
            include: [{
                model: Reservation,
                as: 'reservations',
                required: false,
                where: {
                    status: { [Op.ne]: 'CANCELLED' },
                    [Op.or]: [
                        {
                            start_time: { [Op.lt]: endTime },
                            end_time: { [Op.gt]: startTime }
                        }
                    ]
                }
            }]
        });

        // Filtrar solo los que no tienen reservas en conflicto
        return resources.filter(r => r.reservations.length === 0);
    }

    /**
     * Cambiar el estado activo de un recurso
     * @param {string} id - ID del recurso
     * @param {boolean} activo - Nuevo estado
     * @returns {Promise<Resource|null>}
     */
    async toggleActive(id, activo) {
        return this.update(id, { activo });
    }

    /**
     * Obtener recursos por tipo
     * @param {string} tipo - Tipo de recurso
     * @returns {Promise<Resource[]>}
     */
    async findByType(tipo) {
        const resources = await Resource.findAll({
            where: { tipo, activo: true },
            order: [['nombre', 'ASC']]
        });
        return resources;
    }
}

module.exports = new ResourceService();
