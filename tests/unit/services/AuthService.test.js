/**
 * Tests unitarios para AuthService
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Mocks
jest.mock('../../../src/models', () => ({
    User: {
        findOne: jest.fn(),
        update: jest.fn(),
        create: jest.fn()
    },
    RefreshToken: {
        create: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        generateToken: () => 'mock_refresh_token_123'
    },
    TokenBlacklist: {
        create: jest.fn(),
        isBlacklisted: jest.fn().mockResolvedValue(false)
    }
}));

jest.mock('../../../src/services/UserService', () => ({
    UserService: {
        create: jest.fn(),
        findById: jest.fn()
    },
    UserServiceError: class UserServiceError extends Error {
        constructor(message, code) {
            super(message);
            this.code = code;
        }
    },
    ERROR_CODES: {
        INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
        EMAIL_DUPLICATED: 'EMAIL_DUPLICATED'
    }
}));

const { AuthService, AuthServiceError, AUTH_ERROR_CODES, CONFIG } = require('../../../src/services/AuthService');
const { User, RefreshToken, TokenBlacklist } = require('../../../src/models');
const { generateTestUser, mockRequest } = require('../../helpers/testUtils');

describe('AuthService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('generateAccessToken', () => {
        it('debería generar un access token válido', () => {
            const user = generateTestUser();

            const result = AuthService.generateAccessToken(user);

            expect(result).toHaveProperty('token');
            expect(result).toHaveProperty('jti');
            expect(result).toHaveProperty('expiresAt');
            expect(typeof result.token).toBe('string');
            expect(result.token.split('.')).toHaveLength(3); // JWT format
        });

        it('debería incluir rol y email en el payload', () => {
            const user = generateTestUser({ rol: 'ADMIN' });

            const { token } = AuthService.generateAccessToken(user);
            const decoded = jwt.decode(token);

            expect(decoded.email).toBe(user.email);
            expect(decoded.rol).toBe('ADMIN');
            expect(decoded.jti).toBeDefined();
        });
    });

    describe('verifyAccessToken', () => {
        it('debería lanzar error si no se proporciona token', async () => {
            await expect(AuthService.verifyAccessToken(null))
                .rejects
                .toThrow(AuthServiceError);

            await expect(AuthService.verifyAccessToken(null))
                .rejects
                .toMatchObject({ code: AUTH_ERROR_CODES.TOKEN_MISSING });
        });

        it('debería lanzar error para token inválido', async () => {
            await expect(AuthService.verifyAccessToken('invalid_token'))
                .rejects
                .toMatchObject({ code: AUTH_ERROR_CODES.TOKEN_INVALID });
        });

        it('debería verificar token válido', async () => {
            const user = generateTestUser();
            const { token } = AuthService.generateAccessToken(user);

            const decoded = await AuthService.verifyAccessToken(token);

            expect(decoded.id).toBe(user.id);
            expect(decoded.email).toBe(user.email);
        });

        it('debería rechazar token en blacklist', async () => {
            const user = generateTestUser();
            const { token } = AuthService.generateAccessToken(user);

            TokenBlacklist.isBlacklisted.mockResolvedValueOnce(true);

            await expect(AuthService.verifyAccessToken(token))
                .rejects
                .toMatchObject({ code: AUTH_ERROR_CODES.TOKEN_BLACKLISTED });
        });
    });

    describe('checkAccountLockout', () => {
        it('debería lanzar error si cuenta está bloqueada', async () => {
            const lockedUser = {
                locked_until: new Date(Date.now() + 600000) // 10 minutos en el futuro
            };

            await expect(AuthService.checkAccountLockout(lockedUser))
                .rejects
                .toMatchObject({ code: AUTH_ERROR_CODES.ACCOUNT_LOCKED });
        });

        it('no debería lanzar error si bloqueo expiró', async () => {
            const expiredLockUser = {
                locked_until: new Date(Date.now() - 60000) // 1 minuto en el pasado
            };

            await expect(AuthService.checkAccountLockout(expiredLockUser))
                .resolves
                .not.toThrow();
        });

        it('no debería lanzar error si no hay bloqueo', async () => {
            const normalUser = { locked_until: null };

            await expect(AuthService.checkAccountLockout(normalUser))
                .resolves
                .not.toThrow();
        });
    });

    describe('recordFailedLogin', () => {
        it('debería incrementar contador de intentos fallidos', async () => {
            const user = { id: 'user-123', failed_login_attempts: 2 };
            User.update.mockResolvedValue([1]);

            const attempts = await AuthService.recordFailedLogin(user);

            expect(attempts).toBe(3);
            expect(User.update).toHaveBeenCalledWith(
                expect.objectContaining({ failed_login_attempts: 3 }),
                expect.any(Object)
            );
        });

        it('debería bloquear cuenta después de 5 intentos', async () => {
            const user = { id: 'user-123', failed_login_attempts: 4 };
            User.update.mockResolvedValue([1]);

            await AuthService.recordFailedLogin(user);

            expect(User.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    failed_login_attempts: 5,
                    locked_until: expect.any(Date)
                }),
                expect.any(Object)
            );
        });
    });

    describe('resetFailedLogins', () => {
        it('debería resetear contador y actualizar last_login', async () => {
            const user = { id: 'user-123' };
            User.update.mockResolvedValue([1]);

            await AuthService.resetFailedLogins(user);

            expect(User.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    failed_login_attempts: 0,
                    locked_until: null,
                    last_login: expect.any(Date)
                }),
                expect.any(Object)
            );
        });
    });

    describe('login', () => {
        const mockUserData = {
            id: 'user-123',
            email: 'test@example.com',
            password: '$2b$10$hashedpassword',
            rol: 'USER',
            activo: true,
            failed_login_attempts: 0,
            locked_until: null,
            toJSON: function () { return { ...this, password: undefined }; }
        };

        beforeEach(() => {
            User.findOne.mockResolvedValue(mockUserData);
            User.update.mockResolvedValue([1]);
            RefreshToken.create.mockResolvedValue({});
        });

        it('debería lanzar error con credenciales inválidas', async () => {
            User.findOne.mockResolvedValue(null);

            await expect(AuthService.login('wrong@email.com', 'password'))
                .rejects
                .toThrow('Credenciales inválidas');
        });

        it('debería lanzar error si cuenta está bloqueada', async () => {
            User.findOne.mockResolvedValue({
                ...mockUserData,
                locked_until: new Date(Date.now() + 600000)
            });

            await expect(AuthService.login('test@example.com', 'password'))
                .rejects
                .toMatchObject({ code: AUTH_ERROR_CODES.ACCOUNT_LOCKED });
        });
    });

    describe('logout', () => {
        it('debería añadir token a blacklist', async () => {
            const user = generateTestUser();
            const { token } = AuthService.generateAccessToken(user);
            TokenBlacklist.create.mockResolvedValue({});
            RefreshToken.update.mockResolvedValue([1]);

            const result = await AuthService.logout(token, 'refresh_token_123');

            expect(result).toBe(true);
            expect(TokenBlacklist.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    user_id: user.id,
                    reason: 'LOGOUT'
                })
            );
        });

        it('debería revocar refresh token si se proporciona', async () => {
            const user = generateTestUser();
            const { token } = AuthService.generateAccessToken(user);
            TokenBlacklist.create.mockResolvedValue({});
            RefreshToken.update.mockResolvedValue([1]);

            await AuthService.logout(token, 'some_refresh_token');

            expect(RefreshToken.update).toHaveBeenCalledWith(
                expect.objectContaining({ revoked: true }),
                expect.objectContaining({ where: { token: 'some_refresh_token' } })
            );
        });
    });

    describe('CONFIG', () => {
        it('debería tener configuración correcta', () => {
            expect(CONFIG.ACCESS_TOKEN_EXPIRATION).toBe('15m');
            expect(CONFIG.REFRESH_TOKEN_EXPIRATION_DAYS).toBe(7);
            expect(CONFIG.MAX_LOGIN_ATTEMPTS).toBe(5);
            expect(CONFIG.LOCKOUT_DURATION_MINUTES).toBe(15);
        });
    });
});
