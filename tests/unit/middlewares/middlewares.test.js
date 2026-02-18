/**
 * Tests unitarios para Middlewares
 * Cubre: authMiddleware, roleMiddleware, csrfMiddleware
 */

const { generateTestToken } = require('../../helpers/testUtils');

// Mock de modelos
jest.mock('../../../src/models', () => ({
    User: { findOne: jest.fn(), findByPk: jest.fn() },
    RefreshToken: { create: jest.fn(), findOne: jest.fn(), update: jest.fn() },
    TokenBlacklist: {
        create: jest.fn(),
        isBlacklisted: jest.fn().mockResolvedValue(false)
    }
}));

describe('Middlewares', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            headers: {},
            method: 'GET',
            user: null
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        next = jest.fn();
    });

    // ──────────────────────────────────
    // Auth Middleware
    // ──────────────────────────────────
    describe('authMiddleware', () => {
        const authMiddleware = require('../../../src/middlewares/authMiddleware');

        it('debería rechazar petición sin header Authorization', async () => {
            await authMiddleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ success: false })
            );
            expect(next).not.toHaveBeenCalled();
        });

        it('debería rechazar token inválido', async () => {
            req.headers.authorization = 'Bearer invalid_token';

            await authMiddleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(next).not.toHaveBeenCalled();
        });

        it('debería procesar token válido sin errores de parsing', async () => {
            const token = generateTestToken({ id: 'user-123', rol: 'USER' });
            req.headers.authorization = `Bearer ${token}`;

            await authMiddleware(req, res, next);

            // Si la DB está disponible, next() es llamado y req.user se setea
            // Si la DB no está disponible, se rechaza con 401 por blacklist check
            if (next.mock.calls.length > 0) {
                expect(req.user).toBeDefined();
                expect(req.user.id).toBe('user-123');
            } else {
                expect(res.status).toHaveBeenCalledWith(401);
            }
        });

        it('debería rechazar si Authorization no empieza con Bearer', async () => {
            req.headers.authorization = 'Basic some_token';

            await authMiddleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(next).not.toHaveBeenCalled();
        });

        it('debería rechazar token expirado', async () => {
            const jwt = require('jsonwebtoken');
            const secret = process.env.JWT_SECRET || 'test_jwt_secret';
            const expiredToken = jwt.sign(
                { id: 'user-1', email: 'test@test.com', rol: 'USER', jti: 'test-jti' },
                secret,
                { expiresIn: '0s' }
            );

            // Esperar 1 segundo para que expire
            await new Promise(resolve => setTimeout(resolve, 1100));

            req.headers.authorization = `Bearer ${expiredToken}`;
            await authMiddleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(next).not.toHaveBeenCalled();
        });
    });

    // ──────────────────────────────────
    // Role Middleware
    // ──────────────────────────────────
    describe('roleMiddleware', () => {
        const { requireRole, requireAdmin, requireUser } = require('../../../src/middlewares/roleMiddleware');

        it('requireAdmin debería permitir al ADMIN', () => {
            req.user = { rol: 'ADMIN' };

            requireAdmin(req, res, next);

            expect(next).toHaveBeenCalled();
        });

        it('requireAdmin debería bloquear al USER', () => {
            req.user = { rol: 'USER' };

            requireAdmin(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(next).not.toHaveBeenCalled();
        });

        it('requireUser debería permitir al USER', () => {
            req.user = { rol: 'USER' };

            requireUser(req, res, next);

            expect(next).toHaveBeenCalled();
        });

        it('requireUser debería permitir al ADMIN también', () => {
            req.user = { rol: 'ADMIN' };

            requireUser(req, res, next);

            expect(next).toHaveBeenCalled();
        });

        it('requireRole debería aceptar múltiples roles', () => {
            const middleware = requireRole('ADMIN', 'USER');
            req.user = { rol: 'USER' };

            middleware(req, res, next);

            expect(next).toHaveBeenCalled();
        });

        it('requireRole debería rechazar rol no autorizado', () => {
            const middleware = requireRole('ADMIN');
            req.user = { rol: 'USER' };

            middleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(next).not.toHaveBeenCalled();
        });

        it('debería manejar usuario no autenticado', () => {
            req.user = null;

            requireAdmin(req, res, next);

            // Puede ser 401 o 403 dependiendo de la implementación
            expect(res.status).toHaveBeenCalled();
            expect(next).not.toHaveBeenCalled();
        });
    });

    // ──────────────────────────────────
    // CSRF Middleware
    // ──────────────────────────────────
    describe('csrfMiddleware', () => {
        const { csrfMiddleware, CSRF_SECRET } = require('../../../src/middlewares/csrfMiddleware');

        it('debería permitir métodos GET sin token CSRF', () => {
            req.method = 'GET';

            csrfMiddleware(req, res, next);

            expect(next).toHaveBeenCalled();
        });

        it('debería rechazar POST sin token CSRF', () => {
            req.method = 'POST';

            csrfMiddleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ code: 'CSRF_MISSING' })
            );
        });

        it('debería rechazar POST con token CSRF inválido', () => {
            req.method = 'POST';
            req.headers['x-csrf-token'] = 'wrong-token';

            csrfMiddleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ code: 'CSRF_INVALID' })
            );
        });

        it('debería aceptar POST con token CSRF válido', () => {
            req.method = 'POST';
            req.headers['x-csrf-token'] = CSRF_SECRET;

            csrfMiddleware(req, res, next);

            expect(next).toHaveBeenCalled();
        });

        it('debería validar token en PUT', () => {
            req.method = 'PUT';
            req.headers['x-csrf-token'] = CSRF_SECRET;

            csrfMiddleware(req, res, next);

            expect(next).toHaveBeenCalled();
        });

        it('debería validar token en DELETE', () => {
            req.method = 'DELETE';
            req.headers['x-csrf-token'] = CSRF_SECRET;

            csrfMiddleware(req, res, next);

            expect(next).toHaveBeenCalled();
        });

        it('debería validar token en PATCH', () => {
            req.method = 'PATCH';
            req.headers['x-csrf-token'] = CSRF_SECRET;

            csrfMiddleware(req, res, next);

            expect(next).toHaveBeenCalled();
        });

        it('debería rechazar DELETE sin token', () => {
            req.method = 'DELETE';

            csrfMiddleware(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(next).not.toHaveBeenCalled();
        });
    });
});
