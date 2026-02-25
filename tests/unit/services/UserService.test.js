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

const mockRole = {
    findOne: jest.fn(),
    findAll: jest.fn()
};

jest.mock('../../../src/models', () => ({
    User: mockUser,
    Role: mockRole,
    sequelize: { Op: require('sequelize').Op },
    Sequelize: { Op: require('sequelize').Op }
}));

const { UserService } = require('../../../src/services/UserService');
const { ConflictError, NotFoundError } = require('../../../src/errors/AppError');

describe('UserService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('debería crear un usuario con password hasheada', async () => {
            mockUser.findOne.mockResolvedValue(null);
            const mockCreatedUser = {
                addRoles: jest.fn(),
                addRole: jest.fn(),
                reload: jest.fn(),
                toJSON: () => ({
                    id: 'user-1',
                    username: 'testuser',
                    email: 'test@test.com',
                    password: 'hashed',
                    firstName: 'Test',
                    lastName: 'User',
                    roles: []
                })
            };
            mockUser.create.mockResolvedValue(mockCreatedUser);
            mockRole.findOne.mockResolvedValue({ id: 'role-user', name: 'user' });

            const result = await UserService.create({
                username: 'testuser',
                email: 'test@test.com',
                password: 'Test123!',
                firstName: 'Test',
                lastName: 'User'
            });

            expect(result).not.toHaveProperty('password');
            expect(result.username).toBe('testuser');
            expect(mockUser.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    username: 'testuser',
                    email: 'test@test.com',
                    password: expect.not.stringMatching('Test123!')
                })
            );
        });

        it('debería lanzar error si el email ya existe', async () => {
            mockUser.findOne.mockResolvedValue({ id: 'existing-user' });

            await expect(UserService.create({
                username: 'testuser',
                email: 'existing@test.com',
                password: 'Test123!'
            })).rejects.toThrow(ConflictError);
        });
    });

    describe('findById', () => {
        it('debería retornar usuario sin password', async () => {
            mockUser.findByPk.mockResolvedValue({
                id: 'user-1',
                username: 'testuser',
                email: 'test@test.com'
            });

            const result = await UserService.findById('user-1');

            expect(result.id).toBe('user-1');
            expect(mockUser.findByPk).toHaveBeenCalledWith('user-1', expect.objectContaining({
                attributes: { exclude: ['password'] }
            }));
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
                    { id: 'user-1', username: 'User1' },
                    { id: 'user-2', username: 'User2' }
                ]
            });

            const result = await UserService.findAll({ page: 1, limit: 10 });

            expect(result.users).toHaveLength(2);
            expect(result.pagination.total).toBe(2);
            expect(result.pagination.page).toBe(1);
            expect(result.pagination.totalPages).toBe(1);
        });
    });

    describe('update', () => {
        it('debería actualizar un usuario', async () => {
            const mockInstance = {
                email: 'old@test.com',
                username: 'olduser',
                firstName: 'Old',
                lastName: 'User',
                update: jest.fn().mockResolvedValue(true),
                reload: jest.fn(),
                toJSON: () => ({
                    id: 'user-1',
                    username: 'Updated',
                    password: 'hashed',
                    roles: []
                })
            };
            mockUser.findByPk.mockResolvedValue(mockInstance);
            // Mock duplicate checks return null (no duplicates)
            mockUser.findOne.mockResolvedValue(null);

            const result = await UserService.update('user-1', { username: 'Updated' });

            expect(result.username).toBe('Updated');
            expect(result).not.toHaveProperty('password');
        });

        it('debería lanzar NotFoundError si usuario no existe', async () => {
            mockUser.findByPk.mockResolvedValue(null);

            await expect(UserService.update('nonexistent', { username: 'Test' }))
                .rejects.toThrow(NotFoundError);
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

        it('debería lanzar NotFoundError si usuario no existe', async () => {
            mockUser.findByPk.mockResolvedValue(null);

            await expect(UserService.delete('nonexistent'))
                .rejects.toThrow(NotFoundError);
        });
    });

    describe('verifyCredentials', () => {
        it('debería lanzar error si usuario no existe', async () => {
            mockUser.findOne.mockResolvedValue(null);

            await expect(UserService.verifyCredentials('wrong@test.com', 'pass'))
                .rejects.toThrow(NotFoundError);
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
                .rejects.toThrow(NotFoundError);
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

    describe('deactivateUser', () => {
        it('debería desactivar un usuario', async () => {
            const mockInstance = {
                id: 'user-1',
                username: 'testuser',
                email: 'test@test.com',
                activo: true,
                update: jest.fn().mockResolvedValue(true)
            };
            mockUser.findByPk.mockResolvedValue(mockInstance);

            await UserService.deactivateUser('user-1', 'admin-user-id');

            expect(mockInstance.update).toHaveBeenCalledWith({ activo: false });
        });

        it('debería lanzar error al intentar desactivarse a sí mismo', async () => {
            await expect(UserService.deactivateUser('user-1', 'user-1'))
                .rejects.toThrow('No puedes desactivarte a ti mismo');
        });
    });

    describe('reactivateUser', () => {
        it('debería reactivar un usuario', async () => {
            const mockInstance = {
                id: 'user-1',
                username: 'testuser',
                email: 'test@test.com',
                activo: false,
                update: jest.fn().mockResolvedValue(true)
            };
            mockUser.findByPk.mockResolvedValue(mockInstance);

            await UserService.reactivateUser('user-1');

            expect(mockInstance.update).toHaveBeenCalledWith({ activo: true });
        });
    });
});
