/**
 * Tests unitarios para ReservationService
 * Estos tests verifican la lógica de negocio sin base de datos
 */

// Definir mocks ANTES del import
const mockReservation = {
    create: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
};

const mockResource = {
    findByPk: jest.fn()
};

const mockUser = {
    findByPk: jest.fn()
};

// Mock de modelos - debe estar antes del require del servicio
jest.mock('../../../src/models', () => ({
    Reservation: mockReservation,
    Resource: mockResource,
    User: mockUser,
    sequelize: {
        fn: jest.fn(),
        col: jest.fn(),
        literal: jest.fn()
    },
    Sequelize: {
        Op: require('sequelize').Op
    }
}));

// Importar después del mock
const { generateTestReservation, generateTestResource } = require('../../helpers/testUtils');

describe('ReservationService', () => {
    // Importar el servicio dentro del describe para que use los mocks
    let ReservationService, ReservationServiceError, RESERVATION_ERROR_CODES;

    beforeAll(() => {
        const service = require('../../../src/services/ReservationService');
        ReservationService = service.ReservationService;
        ReservationServiceError = service.ReservationServiceError;
        RESERVATION_ERROR_CODES = service.RESERVATION_ERROR_CODES;
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('ReservationServiceError', () => {
        it('debería crear errores con mensaje y código', () => {
            const error = new ReservationServiceError('Test error', 'TEST_CODE');

            expect(error.message).toBe('Test error');
            expect(error.code).toBe('TEST_CODE');
            expect(error.name).toBe('ReservationServiceError');
            expect(error instanceof Error).toBe(true);
        });
    });



    describe('create - Validación de recurso', () => {
        it('debería rechazar si recurso no existe', async () => {
            mockResource.findByPk.mockResolvedValue(null);

            await expect(ReservationService.create({
                user_id: 'user-1',
                resource_id: 'nonexistent-resource',
                start_time: new Date('2024-01-15T10:00:00Z'),
                end_time: new Date('2024-01-15T11:00:00Z')
            })).rejects.toThrow('Recurso no encontrado');
        });

        it('debería rechazar si recurso está inactivo', async () => {
            mockResource.findByPk.mockResolvedValue({
                id: 'resource-1',
                activo: false
            });

            await expect(ReservationService.create({
                user_id: 'user-1',
                resource_id: 'resource-1',
                start_time: new Date('2024-01-15T10:00:00Z'),
                end_time: new Date('2024-01-15T11:00:00Z')
            })).rejects.toThrow('no está disponible');
        });
    });



    describe('findById', () => {
        it('debería retornar null si no existe', async () => {
            mockReservation.findByPk.mockResolvedValue(null);

            const result = await ReservationService.findById('nonexistent');

            expect(result).toBeNull();
        });

        it('debería retornar reserva con relaciones', async () => {
            const mockData = {
                id: 'reservation-1',
                user_id: 'user-1',
                resource_id: 'resource-1',
                user: { id: 'user-1', nombre: 'Test User' },
                resource: { id: 'resource-1', nombre: 'Sala 1' }
            };
            mockReservation.findByPk.mockResolvedValue(mockData);

            const result = await ReservationService.findById('reservation-1');

            expect(result).toEqual(mockData);
            expect(mockReservation.findByPk).toHaveBeenCalledWith(
                'reservation-1',
                expect.objectContaining({ include: expect.any(Array) })
            );
        });
    });

    describe('confirm - Transiciones de estado', () => {
        it('debería confirmar reserva pendiente', async () => {
            const mockReservationData = {
                id: 'reservation-1',
                status: 'PENDING',
                update: jest.fn().mockResolvedValue(true)
            };
            mockReservation.findByPk.mockResolvedValue(mockReservationData);

            await ReservationService.confirm('reservation-1');

            expect(mockReservationData.update).toHaveBeenCalledWith(
                expect.objectContaining({ status: 'CONFIRMED' })
            );
        });

        it('debería rechazar confirmar reserva ya confirmada', async () => {
            mockReservation.findByPk.mockResolvedValue({
                id: 'reservation-1',
                status: 'CONFIRMED'
            });

            await expect(ReservationService.confirm('reservation-1'))
                .rejects
                .toThrow();
        });

        it('debería rechazar confirmar reserva cancelada', async () => {
            mockReservation.findByPk.mockResolvedValue({
                id: 'reservation-1',
                status: 'CANCELLED'
            });

            await expect(ReservationService.confirm('reservation-1'))
                .rejects
                .toThrow();
        });
    });

    describe('cancel - Reglas de cancelación', () => {
        it('debería permitir cancelación por el propietario', async () => {
            const futureDate = new Date();
            futureDate.setHours(futureDate.getHours() + 24);

            const mockReservationData = {
                id: 'reservation-1',
                user_id: 'user-1',
                status: 'CONFIRMED',
                start_time: futureDate,
                update: jest.fn().mockResolvedValue(true)
            };
            mockReservation.findByPk.mockResolvedValue(mockReservationData);

            await ReservationService.cancel('reservation-1', 'user-1', 'USER');

            expect(mockReservationData.update).toHaveBeenCalledWith(
                expect.objectContaining({ status: 'CANCELLED' })
            );
        });

        it('debería permitir cancelación por ADMIN', async () => {
            const futureDate = new Date();
            futureDate.setHours(futureDate.getHours() + 24);

            const mockReservationData = {
                id: 'reservation-1',
                user_id: 'user-1',
                status: 'CONFIRMED',
                start_time: futureDate,
                update: jest.fn().mockResolvedValue(true)
            };
            mockReservation.findByPk.mockResolvedValue(mockReservationData);

            await ReservationService.cancel('reservation-1', 'admin-user', 'ADMIN');

            expect(mockReservationData.update).toHaveBeenCalled();
        });

        it('debería rechazar cancelación por no propietario', async () => {
            const futureDate = new Date();
            futureDate.setHours(futureDate.getHours() + 24);

            mockReservation.findByPk.mockResolvedValue({
                id: 'reservation-1',
                user_id: 'user-1',
                status: 'CONFIRMED',
                start_time: futureDate
            });

            await expect(ReservationService.cancel('reservation-1', 'other-user', 'USER'))
                .rejects
                .toThrow();
        });
    });
});
