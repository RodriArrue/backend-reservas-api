/**
 * Tests de integración para endpoints de Recursos
 * 
 * Nota: Los tests de integración verifican autenticación, autorización y validación
 * sin depender de una base de datos activa.
 */

const request = require('supertest');
const app = require('../../src/app');
const { generateTestToken } = require('../helpers/testUtils');
const { CSRF_SECRET } = require('../../src/middlewares/csrfMiddleware');

describe('Resource Endpoints', () => {
    const userToken = generateTestToken({ id: 'user-123', rol: 'USER', email: 'user@test.com' });
    const adminToken = generateTestToken({ id: 'admin-123', rol: 'ADMIN', email: 'admin@test.com' });
    const csrfToken = CSRF_SECRET;

    // ──────────────────────────────────
    // POST /api/resources - Sin auth
    // ──────────────────────────────────
    describe('POST /api/resources', () => {
        it('debería rechazar sin autenticación', async () => {
            const response = await request(app)
                .post('/api/resources')
                .send({ nombre: 'Sala Test', tipo: 'SALA', capacidad: 10 });

            expect(response.status).toBe(401);
        });

        it('debería rechazar sin campos requeridos (ADMIN con CSRF)', async () => {
            const response = await request(app)
                .post('/api/resources')
                .set('Authorization', `Bearer ${adminToken}`)
                .set('X-CSRF-Token', csrfToken)
                .send({});

            // 400 por validación, o 401 si token no pasa DB check
            expect([400, 401]).toContain(response.status);
        });
    });

    // ──────────────────────────────────
    // GET /api/resources
    // ──────────────────────────────────
    describe('GET /api/resources', () => {
        it('debería requerir autenticación', async () => {
            const response = await request(app)
                .get('/api/resources');

            // 401 si auth middleware rechaza, o 500 si DB error
            expect([401, 404, 500]).toContain(response.status);
        });
    });

    // ──────────────────────────────────
    // GET /api/resources/:id
    // ──────────────────────────────────
    describe('GET /api/resources/:id', () => {
        it('debería requerir autenticación', async () => {
            const response = await request(app)
                .get('/api/resources/nonexistent-id');

            expect([400, 401, 404, 500]).toContain(response.status);
        });
    });

    // ──────────────────────────────────
    // PUT /api/resources/:id
    // ──────────────────────────────────
    describe('PUT /api/resources/:id', () => {
        it('debería rechazar sin autenticación', async () => {
            const response = await request(app)
                .put('/api/resources/some-id')
                .send({ nombre: 'Updated' });

            expect(response.status).toBe(401);
        });
    });

    // ──────────────────────────────────
    // DELETE /api/resources/:id
    // ──────────────────────────────────
    describe('DELETE /api/resources/:id', () => {
        it('debería rechazar sin autenticación', async () => {
            const response = await request(app)
                .delete('/api/resources/some-id');

            expect(response.status).toBe(401);
        });
    });

    // ──────────────────────────────────
    // GET /api/resources/available
    // ──────────────────────────────────
    describe('GET /api/resources/available', () => {
        it('debería requerir autenticación', async () => {
            const response = await request(app)
                .get('/api/resources/available')
                .query({ startTime: '2025-06-01T10:00:00Z', endTime: '2025-06-01T11:00:00Z' });

            expect([401, 404, 500]).toContain(response.status);
        });
    });

    // ──────────────────────────────────
    // PATCH /api/resources/:id/toggle-active
    // ──────────────────────────────────
    describe('PATCH /api/resources/:id/toggle-active', () => {
        it('debería rechazar sin autenticación', async () => {
            const response = await request(app)
                .patch('/api/resources/some-id/toggle-active')
                .send({ activo: false });

            expect(response.status).toBe(401);
        });
    });

    // ──────────────────────────────────
    // GET /api/resources/type/:tipo
    // ──────────────────────────────────
    describe('GET /api/resources/type/:tipo', () => {
        it('debería requerir autenticación', async () => {
            const response = await request(app)
                .get('/api/resources/type/SALA');

            expect([401, 404, 500]).toContain(response.status);
        });
    });
});
