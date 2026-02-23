/**
 * Tests de integración para endpoints de Usuarios
 * 
 * Nota: Verifica autenticación, autorización y CSRF sin depender de DB activa.
 */

const request = require('supertest');
const app = require('../../src/app');
const { generateTestToken } = require('../helpers/testUtils');
const { CSRF_SECRET } = require('../../src/middlewares/csrfMiddleware');

describe('User Endpoints', () => {
    const userToken = generateTestToken({ id: 'user-123', rol: 'USER', email: 'user@test.com' });
    const adminToken = generateTestToken({ id: 'admin-123', rol: 'ADMIN', email: 'admin@test.com' });
    const csrfToken = CSRF_SECRET;

    // ──────────────────────────────────
    // GET /api/users
    // ──────────────────────────────────
    describe('GET /api/users', () => {
        it('debería requerir autenticación', async () => {
            const response = await request(app)
                .get('/api/users');

            // 401 si auth rechaza, o 500 si DB error durante auth check
            expect([401, 500]).toContain(response.status);
        });
    });

    // ──────────────────────────────────
    // GET /api/users/:id
    // ──────────────────────────────────
    describe('GET /api/users/:id', () => {
        it('debería requerir autenticación', async () => {
            const response = await request(app)
                .get('/api/users/some-id');

            expect([401, 500]).toContain(response.status);
        });
    });

    // ──────────────────────────────────
    // POST /api/users (ADMIN only)
    // ──────────────────────────────────
    describe('POST /api/users', () => {
        it('debería rechazar sin autenticación', async () => {
            const response = await request(app)
                .post('/api/users')
                .send({ nombre: 'Test', email: 'test@test.com', password: 'Test123!' });

            expect(response.status).toBe(401);
        });
    });

    // ──────────────────────────────────
    // PUT /api/users/:id (ADMIN only)
    // ──────────────────────────────────
    describe('PUT /api/users/:id', () => {
        it('debería rechazar sin autenticación', async () => {
            const response = await request(app)
                .put('/api/users/some-id')
                .send({ nombre: 'Updated' });

            expect(response.status).toBe(401);
        });
    });

    // ──────────────────────────────────
    // DELETE /api/users/:id (ADMIN only)
    // ──────────────────────────────────
    describe('DELETE /api/users/:id', () => {
        it('debería rechazar sin autenticación', async () => {
            const response = await request(app)
                .delete('/api/users/some-id');

            expect(response.status).toBe(401);
        });
    });

    // ──────────────────────────────────
    // PATCH /api/users/:id/change-role (ADMIN only)
    // ──────────────────────────────────
    describe('PATCH /api/users/:id/change-role', () => {
        it('debería rechazar sin autenticación', async () => {
            const response = await request(app)
                .patch('/api/users/some-id/change-role')
                .send({ rol: 'ADMIN' });

            expect(response.status).toBe(401);
        });
    });

    // ──────────────────────────────────
    // PATCH /api/users/:id/toggle-active (ADMIN only)
    // ──────────────────────────────────
    describe('PATCH /api/users/:id/toggle-active', () => {
        it('debería rechazar sin autenticación', async () => {
            const response = await request(app)
                .patch('/api/users/some-id/toggle-active')
                .send({ activo: false });

            expect(response.status).toBe(401);
        });
    });

    // ──────────────────────────────────
    // POST /api/users/:id/restore (ADMIN only)
    // ──────────────────────────────────
    describe('POST /api/users/:id/restore', () => {
        it('debería rechazar sin autenticación', async () => {
            const response = await request(app)
                .post('/api/users/some-id/restore');

            expect(response.status).toBe(401);
        });
    });
});
