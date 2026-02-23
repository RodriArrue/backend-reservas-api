/**
 * Tests unitarios para ResourceService
 */

const mockResource = {
    create: jest.fn(),
    findByPk: jest.fn(),
    findAll: jest.fn(),
    findAndCountAll: jest.fn()
};

const mockReservation = {};

jest.mock('../../../src/models', () => ({
    Resource: mockResource,
    Reservation: mockReservation,
    sequelize: { Op: require('sequelize').Op },
    Sequelize: { Op: require('sequelize').Op }
}));

// Importar después del mock
let ResourceService;
beforeAll(() => {
    ResourceService = require('../../../src/services/ResourceService');
});

describe('ResourceService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('debería crear un recurso correctamente', async () => {
            const resourceData = { nombre: 'Sala A', tipo: 'SALA', capacidad: 10 };
            mockResource.create.mockResolvedValue({ id: 'resource-1', ...resourceData });

            const result = await ResourceService.create(resourceData);

            expect(result.nombre).toBe('Sala A');
            expect(mockResource.create).toHaveBeenCalledWith(resourceData);
        });
    });

    describe('findAll', () => {
        it('debería retornar recursos paginados', async () => {
            mockResource.findAndCountAll.mockResolvedValue({
                count: 3,
                rows: [
                    { id: 'r-1', nombre: 'Sala A' },
                    { id: 'r-2', nombre: 'Sala B' },
                    { id: 'r-3', nombre: 'Escritorio 1' }
                ]
            });

            const result = await ResourceService.findAll({ page: 1, limit: 10 });

            expect(result.resources).toHaveLength(3);
            expect(result.total).toBe(3);
            expect(result.totalPages).toBe(1);
        });

        it('debería filtrar por tipo', async () => {
            mockResource.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

            await ResourceService.findAll({ tipo: 'SALA' });

            expect(mockResource.findAndCountAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({ tipo: 'SALA' })
                })
            );
        });

        it('debería filtrar por capacidad mínima', async () => {
            mockResource.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

            await ResourceService.findAll({ capacidadMin: 5 });

            expect(mockResource.findAndCountAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        capacidad: expect.any(Object)
                    })
                })
            );
        });
    });

    describe('findById', () => {
        it('debería retornar un recurso por ID', async () => {
            mockResource.findByPk.mockResolvedValue({
                id: 'resource-1',
                nombre: 'Sala A'
            });

            const result = await ResourceService.findById('resource-1');

            expect(result.nombre).toBe('Sala A');
        });

        it('debería retornar null si no existe', async () => {
            mockResource.findByPk.mockResolvedValue(null);

            const result = await ResourceService.findById('nonexistent');

            expect(result).toBeNull();
        });
    });

    describe('update', () => {
        it('debería actualizar un recurso', async () => {
            const mockInstance = {
                update: jest.fn().mockResolvedValue(true),
                nombre: 'Updated Sala'
            };
            mockResource.findByPk.mockResolvedValue(mockInstance);

            const result = await ResourceService.update('resource-1', { nombre: 'Updated Sala' });

            expect(mockInstance.update).toHaveBeenCalledWith({ nombre: 'Updated Sala' });
            expect(result).toBeTruthy();
        });

        it('debería retornar null si recurso no existe', async () => {
            mockResource.findByPk.mockResolvedValue(null);

            const result = await ResourceService.update('nonexistent', { nombre: 'Test' });

            expect(result).toBeNull();
        });
    });

    describe('delete', () => {
        it('debería eliminar un recurso (soft delete)', async () => {
            const mockInstance = { destroy: jest.fn().mockResolvedValue(true) };
            mockResource.findByPk.mockResolvedValue(mockInstance);

            const result = await ResourceService.delete('resource-1');

            expect(result).toBe(true);
            expect(mockInstance.destroy).toHaveBeenCalled();
        });

        it('debería retornar false si recurso no existe', async () => {
            mockResource.findByPk.mockResolvedValue(null);

            const result = await ResourceService.delete('nonexistent');

            expect(result).toBe(false);
        });
    });

    describe('restore', () => {
        it('debería restaurar un recurso eliminado', async () => {
            const mockInstance = {
                restore: jest.fn().mockResolvedValue(true),
                id: 'resource-1',
                nombre: 'Sala A'
            };
            mockResource.findByPk.mockResolvedValue(mockInstance);

            const result = await ResourceService.restore('resource-1');

            expect(mockInstance.restore).toHaveBeenCalled();
            expect(result).toBeTruthy();
        });

        it('debería retornar null si recurso no existe', async () => {
            mockResource.findByPk.mockResolvedValue(null);

            const result = await ResourceService.restore('nonexistent');

            expect(result).toBeNull();
        });
    });

    describe('toggleActive', () => {
        it('debería activar un recurso', async () => {
            const mockInstance = {
                update: jest.fn().mockResolvedValue(true),
                activo: true
            };
            mockResource.findByPk.mockResolvedValue(mockInstance);

            await ResourceService.toggleActive('resource-1', true);

            expect(mockInstance.update).toHaveBeenCalledWith({ activo: true });
        });

        it('debería desactivar un recurso', async () => {
            const mockInstance = {
                update: jest.fn().mockResolvedValue(true),
                activo: false
            };
            mockResource.findByPk.mockResolvedValue(mockInstance);

            await ResourceService.toggleActive('resource-1', false);

            expect(mockInstance.update).toHaveBeenCalledWith({ activo: false });
        });
    });

    describe('findByType', () => {
        it('debería retornar recursos activos por tipo', async () => {
            mockResource.findAll.mockResolvedValue([
                { id: 'r-1', nombre: 'Sala A', tipo: 'SALA' },
                { id: 'r-2', nombre: 'Sala B', tipo: 'SALA' }
            ]);

            const result = await ResourceService.findByType('SALA');

            expect(result).toHaveLength(2);
            expect(mockResource.findAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { tipo: 'SALA', activo: true }
                })
            );
        });
    });
});
