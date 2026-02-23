const { ResourceService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const { NotFoundError, ValidationError } = require('../utils/errors');

class ResourceController {
    create = catchAsync(async (req, res) => {
        const resource = await ResourceService.create(req.body);
        res.status(201).json({
            success: true,
            data: resource,
            message: 'Recurso creado exitosamente'
        });
    });

    findAll = catchAsync(async (req, res) => {
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
    });

    findById = catchAsync(async (req, res) => {
        const resource = await ResourceService.findById(req.params.id);
        if (!resource) {
            throw new NotFoundError('Recurso');
        }
        res.json({
            success: true,
            data: resource
        });
    });

    findByIdWithReservations = catchAsync(async (req, res) => {
        const resource = await ResourceService.findByIdWithReservations(req.params.id);
        if (!resource) {
            throw new NotFoundError('Recurso');
        }
        res.json({
            success: true,
            data: resource
        });
    });

    update = catchAsync(async (req, res) => {
        const resource = await ResourceService.update(req.params.id, req.body);
        if (!resource) {
            throw new NotFoundError('Recurso');
        }
        res.json({
            success: true,
            data: resource,
            message: 'Recurso actualizado exitosamente'
        });
    });

    delete = catchAsync(async (req, res) => {
        const deleted = await ResourceService.delete(req.params.id);
        if (!deleted) {
            throw new NotFoundError('Recurso');
        }
        res.json({
            success: true,
            message: 'Recurso eliminado exitosamente'
        });
    });

    restore = catchAsync(async (req, res) => {
        const resource = await ResourceService.restore(req.params.id);
        if (!resource) {
            throw new NotFoundError('Recurso');
        }
        res.json({
            success: true,
            data: resource,
            message: 'Recurso restaurado exitosamente'
        });
    });

    findAvailable = catchAsync(async (req, res) => {
        const { startTime, endTime, tipo, capacidadMin } = req.query;

        if (!startTime || !endTime) {
            throw new ValidationError('startTime y endTime son requeridos');
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
    });

    toggleActive = catchAsync(async (req, res) => {
        const { activo } = req.body;
        const resource = await ResourceService.toggleActive(req.params.id, activo);
        if (!resource) {
            throw new NotFoundError('Recurso');
        }
        res.json({
            success: true,
            data: resource,
            message: `Recurso ${activo ? 'activado' : 'desactivado'} exitosamente`
        });
    });

    findByType = catchAsync(async (req, res) => {
        const { tipo } = req.params;
        const resources = await ResourceService.findByType(tipo);
        res.json({
            success: true,
            data: resources
        });
    });
}

module.exports = new ResourceController();
