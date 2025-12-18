const { ResourceService } = require('../services');

class ResourceController {
    async create(req, res) {
        try {
            const resource = await ResourceService.create(req.body);
            res.status(201).json({
                success: true,
                data: resource,
                message: 'Recurso creado exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error al crear recurso'
            });
        }
    }

    async findAll(req, res) {
        try {
            const { page, limit, tipo, activo, capacidadMin, search } = req.query;
            const result = await ResourceService.findAll({
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 10,
                tipo,
                activo: activo !== undefined ? activo === 'true' : undefined,
                capacidadMin: capacidadMin ? parseInt(capacidadMin) : undefined,
                search
            });
            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error al obtener recursos'
            });
        }
    }

    async findById(req, res) {
        try {
            const resource = await ResourceService.findById(req.params.id);
            if (!resource) {
                return res.status(404).json({
                    success: false,
                    error: 'Recurso no encontrado'
                });
            }
            res.json({
                success: true,
                data: resource
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error al obtener recurso'
            });
        }
    }

    async findByIdWithReservations(req, res) {
        try {
            const resource = await ResourceService.findByIdWithReservations(req.params.id);
            if (!resource) {
                return res.status(404).json({
                    success: false,
                    error: 'Recurso no encontrado'
                });
            }
            res.json({
                success: true,
                data: resource
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error al obtener recurso con reservas'
            });
        }
    }

    async update(req, res) {
        try {
            const resource = await ResourceService.update(req.params.id, req.body);
            if (!resource) {
                return res.status(404).json({
                    success: false,
                    error: 'Recurso no encontrado'
                });
            }
            res.json({
                success: true,
                data: resource,
                message: 'Recurso actualizado exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error al actualizar recurso'
            });
        }
    }

    async delete(req, res) {
        try {
            const deleted = await ResourceService.delete(req.params.id);
            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    error: 'Recurso no encontrado'
                });
            }
            res.json({
                success: true,
                message: 'Recurso eliminado exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error al eliminar recurso'
            });
        }
    }

    async restore(req, res) {
        try {
            const resource = await ResourceService.restore(req.params.id);
            if (!resource) {
                return res.status(404).json({
                    success: false,
                    error: 'Recurso no encontrado'
                });
            }
            res.json({
                success: true,
                data: resource,
                message: 'Recurso restaurado exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error al restaurar recurso'
            });
        }
    }

    async findAvailable(req, res) {
        try {
            const { startTime, endTime, tipo, capacidadMin } = req.query;

            if (!startTime || !endTime) {
                return res.status(400).json({
                    success: false,
                    error: 'startTime y endTime son requeridos'
                });
            }

            const resources = await ResourceService.findAvailable(
                new Date(startTime),
                new Date(endTime),
                {
                    tipo,
                    capacidadMin: capacidadMin ? parseInt(capacidadMin) : undefined
                }
            );
            res.json({
                success: true,
                data: resources
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error al buscar recursos disponibles'
            });
        }
    }

    async toggleActive(req, res) {
        try {
            const { activo } = req.body;
            const resource = await ResourceService.toggleActive(req.params.id, activo);
            if (!resource) {
                return res.status(404).json({
                    success: false,
                    error: 'Recurso no encontrado'
                });
            }
            res.json({
                success: true,
                data: resource,
                message: `Recurso ${activo ? 'activado' : 'desactivado'} exitosamente`
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error al cambiar estado del recurso'
            });
        }
    }

    async findByType(req, res) {
        try {
            const { tipo } = req.params;
            const resources = await ResourceService.findByType(tipo);
            res.json({
                success: true,
                data: resources
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error al buscar recursos por tipo'
            });
        }
    }
}

module.exports = new ResourceController();
