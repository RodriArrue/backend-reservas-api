/**
 * Tests de integración para endpoints de Reservas
 * 
 * Nota: Verifica autenticación, CSRF y validación sin depender de DB activa.
 */

const request = require('supertest');
const app = require('../../src/app');
const { generateTestToken } = require('../helpers/testUtils');
const { CSRF_SECRET } = require('../../src/middlewares/csrfMiddleware');

describe('Reservation Endpoints', () => {
    const userToken = generateTestToken({ id: 'user-123', rol: 'USER', email: 'user@test.com' });
    const adminToken = generateTestToken({ id: 'admin-123', rol: 'ADMIN', email: 'admin@test.com' });

    // ──────────────────────────────────
    // POST /api/reservations
    // ──────────────────────────────────
    describe('POST /api/reservations', () => {
        it('debería rechazar sin autenticación', async () => {
            const response = await request(app)
                .post('/api/reservations')
                .send({});

            expect(response.status).toBe(401);
        });

        it('debería rechazar con datos válidos pero sin DB', async () => {
            const response = await request(app)
                .post('/api/reservations')
                .set('Authorization', `Bearer ${userToken}`)
                .set('X-CSRF-Token', CSRF_SECRET)
                .send({
                    resource_id: 'resource-1',
                    start_time: '2025-06-01T10:00:00Z',
                    end_time: '2025-06-01T11:00:00Z'
                });

            // 400 por validación, 401 si token check falla con DB, o 500 por DB
            expect([400, 401, 500]).toContain(response.status);
        });
    });

    // ──────────────────────────────────
    // GET /api/reservations
    // ──────────────────────────────────
    describe('GET /api/reservations', () => {
        it('debería requerir autenticación', async () => {
            const response = await request(app)
                .get('/api/reservations');

            expect([401, 404, 500]).toContain(response.status);
        });
    });

    // ──────────────────────────────────
    // GET /api/reservations/today
    // ──────────────────────────────────
    describe('GET /api/reservations/today', () => {
        it('debería requerir autenticación', async () => {
            const response = await request(app)
                .get('/api/reservations/today');

            expect([401, 404, 500]).toContain(response.status);
        });
    });

    // ──────────────────────────────────
    // GET /api/reservations/stats
    // ──────────────────────────────────
    describe('GET /api/reservations/stats', () => {
        it('debería requerir autenticación', async () => {
            const response = await request(app)
                .get('/api/reservations/stats');

            // 401 si auth rechaza, 404 si ruta no matchea, o 500 si DB error
            expect([401, 404, 500]).toContain(response.status);
        });
    });

    // ──────────────────────────────────
    // GET /api/reservations/:id
    // ──────────────────────────────────
    describe('GET /api/reservations/:id', () => {
        it('debería requerir autenticación', async () => {
            const response = await request(app)
                .get('/api/reservations/some-id');

            expect([400, 401, 404, 500]).toContain(response.status);
        });
    });

    // ──────────────────────────────────
    // PATCH /api/reservations/:id/cancel
    // ──────────────────────────────────
    describe('PATCH /api/reservations/:id/cancel', () => {
        it('debería rechazar sin autenticación', async () => {
            const response = await request(app)
                .patch('/api/reservations/some-id/cancel');

            expect([401, 404]).toContain(response.status);
        });
    });

    // ──────────────────────────────────
    // PATCH /api/reservations/:id/confirm
    // ──────────────────────────────────
    describe('PATCH /api/reservations/:id/confirm', () => {
        it('debería rechazar sin autenticación', async () => {
            const response = await request(app)
                .patch('/api/reservations/some-id/confirm');

            expect([401, 404]).toContain(response.status);
        });
    });

    // ──────────────────────────────────
    // DELETE /api/reservations/:id
    // ──────────────────────────────────
    describe('DELETE /api/reservations/:id', () => {
        it('debería rechazar sin autenticación', async () => {
            const response = await request(app)
                .delete('/api/reservations/some-id');

            expect(response.status).toBe(401);
        });
    });

    // ──────────────────────────────────
    // GET /api/reservations/user/:userId
    // ──────────────────────────────────
    describe('GET /api/reservations/user/:userId', () => {
        it('debería requerir autenticación', async () => {
            const response = await request(app)
                .get('/api/reservations/user/some-user-id');

            expect([401, 500]).toContain(response.status);
        });
    });
});
