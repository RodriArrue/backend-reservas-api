/**
 * Tests unitarios para UserService
 */

const bcrypt = require('bcrypt');

// Mocks
const mockUser = {
    findOne: jest.fn(),
    findByPk: jest.fn(),
    findAndCountAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn()
};

jest.mock('../../../src/models', () => ({
    User: mockUser,
    sequelize: { Op: require('sequelize').Op },
    Sequelize: { Op: require('sequelize').Op }
}));

const { UserService, UserServiceError, ERROR_CODES } = require('../../../src/services/UserService');

describe('UserService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('debería crear un usuario con password hasheada', async () => {
            mockUser.findOne.mockResolvedValue(null);
            mockUser.create.mockResolvedValue({
                toJSON: () => ({
                    id: 'user-1',
                    nombre: 'Test',
                    email: 'test@test.com',
                    password: 'hashed',
                    rol: 'USER'
                })
            });

            const result = await UserService.create({
                nombre: 'Test',
                email: 'test@test.com',
                password: 'Test123!'
            });

            expect(result).not.toHaveProperty('password');
            expect(result.nombre).toBe('Test');
            expect(mockUser.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    nombre: 'Test',
                    email: 'test@test.com',
                    password: expect.not.stringMatching('Test123!')
                })
            );
        });

        it('debería lanzar error si el email ya existe', async () => {
            mockUser.findOne.mockResolvedValue({ id: 'existing-user' });

            await expect(UserService.create({
                nombre: 'Test',
                email: 'existing@test.com',
                password: 'Test123!'
            })).rejects.toThrow(UserServiceError);

            await expect(UserService.create({
                nombre: 'Test',
                email: 'existing@test.com',
                password: 'Test123!'
            })).rejects.toMatchObject({ code: ERROR_CODES.EMAIL_DUPLICATED });
        });
    });

    describe('findById', () => {
        it('debería retornar usuario sin password', async () => {
            mockUser.findByPk.mockResolvedValue({
                id: 'user-1',
                nombre: 'Test',
                email: 'test@test.com'
            });

            const result = await UserService.findById('user-1');

            expect(result.id).toBe('user-1');
            expect(mockUser.findByPk).toHaveBeenCalledWith('user-1', {
                attributes: { exclude: ['password'] }
            });
        });

        it('debería retornar null si no existe', async () => {
            mockUser.findByPk.mockResolvedValue(null);

            const result = await UserService.findById('nonexistent');

            expect(result).toBeNull();
        });
    });

    describe('findAll', () => {
        it('debería retornar usuarios paginados', async () => {
            mockUser.findAndCountAll.mockResolvedValue({
                count: 2,
                rows: [
                    { id: 'user-1', nombre: 'User 1' },
                    { id: 'user-2', nombre: 'User 2' }
                ]
            });

            const result = await UserService.findAll({ page: 1, limit: 10 });

            expect(result.users).toHaveLength(2);
            expect(result.total).toBe(2);
            expect(result.page).toBe(1);
            expect(result.totalPages).toBe(1);
        });

        it('debería filtrar por rol', async () => {
            mockUser.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

            await UserService.findAll({ rol: 'ADMIN' });

            expect(mockUser.findAndCountAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({ rol: 'ADMIN' })
                })
            );
        });
    });

    describe('update', () => {
        it('debería actualizar un usuario', async () => {
            const mockInstance = {
                update: jest.fn().mockResolvedValue(true),
                toJSON: () => ({
                    id: 'user-1',
                    nombre: 'Updated',
                    password: 'hashed'
                })
            };
            mockUser.findByPk.mockResolvedValue(mockInstance);

            const result = await UserService.update('user-1', { nombre: 'Updated' });

            expect(result.nombre).toBe('Updated');
            expect(result).not.toHaveProperty('password');
        });

        it('debería retornar null si usuario no existe', async () => {
            mockUser.findByPk.mockResolvedValue(null);

            const result = await UserService.update('nonexistent', { nombre: 'Test' });

            expect(result).toBeNull();
        });

        it('debería hashear password al actualizar', async () => {
            const mockInstance = {
                update: jest.fn().mockResolvedValue(true),
                toJSON: () => ({ id: 'user-1', nombre: 'Test' })
            };
            mockUser.findByPk.mockResolvedValue(mockInstance);

            await UserService.update('user-1', { password: 'NewPass123!' });

            expect(mockInstance.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    password: expect.not.stringMatching('NewPass123!')
                })
            );
        });
    });

    describe('delete', () => {
        it('debería eliminar un usuario (soft delete)', async () => {
            const mockInstance = { destroy: jest.fn().mockResolvedValue(true) };
            mockUser.findByPk.mockResolvedValue(mockInstance);

            const result = await UserService.delete('user-1');

            expect(result).toBe(true);
            expect(mockInstance.destroy).toHaveBeenCalled();
        });

        it('debería lanzar error si usuario no existe', async () => {
            mockUser.findByPk.mockResolvedValue(null);

            await expect(UserService.delete('nonexistent'))
                .rejects.toMatchObject({ code: ERROR_CODES.USER_NOT_FOUND });
        });
    });

    describe('verifyCredentials', () => {
        it('debería lanzar error si usuario no existe', async () => {
            mockUser.findOne.mockResolvedValue(null);

            await expect(UserService.verifyCredentials('wrong@test.com', 'pass'))
                .rejects.toMatchObject({ code: ERROR_CODES.INVALID_CREDENTIALS });
        });

        it('debería lanzar error si password es incorrecta', async () => {
            const hashedPassword = await bcrypt.hash('CorrectPass123!', 10);
            mockUser.findOne.mockResolvedValue({
                id: 'user-1',
                email: 'test@test.com',
                password: hashedPassword,
                toJSON: function () { return { ...this }; }
            });

            await expect(UserService.verifyCredentials('test@test.com', 'WrongPass'))
                .rejects.toMatchObject({ code: ERROR_CODES.INVALID_CREDENTIALS });
        });

        it('debería retornar usuario sin password con credenciales válidas', async () => {
            const hashedPassword = await bcrypt.hash('CorrectPass123!', 10);
            mockUser.findOne.mockResolvedValue({
                id: 'user-1',
                email: 'test@test.com',
                password: hashedPassword,
                toJSON: function () { return { ...this }; }
            });

            const result = await UserService.verifyCredentials('test@test.com', 'CorrectPass123!');

            expect(result.id).toBe('user-1');
            expect(result).not.toHaveProperty('password');
        });
    });

    describe('toggleActive', () => {
        it('debería cambiar estado activo', async () => {
            const mockInstance = {
                update: jest.fn().mockResolvedValue(true),
                toJSON: () => ({ id: 'user-1', activo: false })
            };
            mockUser.findByPk.mockResolvedValue(mockInstance);

            await UserService.toggleActive('user-1', false);

            expect(mockInstance.update).toHaveBeenCalledWith({ activo: false });
        });
    });

    describe('changeRole', () => {
        it('debería cambiar rol del usuario', async () => {
            const mockInstance = {
                update: jest.fn().mockResolvedValue(true),
                toJSON: () => ({ id: 'user-1', rol: 'ADMIN' })
            };
            mockUser.findByPk.mockResolvedValue(mockInstance);

            await UserService.changeRole('user-1', 'ADMIN');

            expect(mockInstance.update).toHaveBeenCalledWith({ rol: 'ADMIN' });
        });
    });
});
