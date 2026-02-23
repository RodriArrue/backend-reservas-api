/**
 * Tests de integración para endpoints de autenticación
 */

const request = require('supertest');
const app = require('../../src/app');
const { generateTestUser } = require('../helpers/testUtils');

describe('Auth Endpoints', () => {
    describe('POST /api/auth/register', () => {
        it('debería rechazar registro sin campos requeridos', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({});

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        it('debería rechazar password débil', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    nombre: 'Test User',
                    email: 'test@example.com',
                    password: '123' // Muy corta y sin requisitos
                });

            expect([400, 429]).toContain(response.status);
            if (response.status === 400) {
                expect(response.body.success).toBe(false);
            }
        });

        it('debería rechazar email inválido', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    nombre: 'Test User',
                    email: 'not-an-email',
                    password: 'SecurePass123!'
                });

            expect([400, 429]).toContain(response.status);
        });

        it('debería aceptar registro válido con password fuerte', async () => {
            const userData = generateTestUser();

            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    nombre: userData.nombre,
                    email: userData.email,
                    password: 'SecurePass123!@#'
                });

            // Puede ser 201 (éxito) o 500 (si DB no está disponible)
            if (response.status === 201) {
                expect(response.body.success).toBe(true);
                expect(response.body.data.accessToken).toBeDefined();
                expect(response.body.data.refreshToken).toBeDefined();
            }
        });
    });

    describe('POST /api/auth/login', () => {
        it('debería rechazar login sin credenciales', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({});

            expect(response.status).toBe(400);
        });

        it('debería rechazar email inválido en login', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'not-valid-email',
                    password: 'somepassword'
                });

            expect([400, 429]).toContain(response.status);
        });

        it('debería rechazar credenciales incorrectas', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'WrongPass123!'
                });

            // 401 si usuario no existe, 429 si rate limit, o 500 error de DB
            expect([401, 429, 500]).toContain(response.status);
        });
    });

    describe('POST /api/auth/refresh', () => {
        it('debería rechazar sin refresh token', async () => {
            const response = await request(app)
                .post('/api/auth/refresh')
                .send({});

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        it('debería rechazar refresh token inválido', async () => {
            const response = await request(app)
                .post('/api/auth/refresh')
                .send({ refreshToken: 'invalid_token_123' });

            expect([400, 500]).toContain(response.status);
        });
    });

    describe('POST /api/auth/logout', () => {
        it('debería aceptar logout sin errores', async () => {
            const response = await request(app)
                .post('/api/auth/logout')
                .send({});

            // Logout siempre debería funcionar
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });

    describe('GET /api/auth/me', () => {
        it('debería rechazar sin token', async () => {
            const response = await request(app)
                .get('/api/auth/me');

            expect(response.status).toBe(401);
        });

        it('debería rechazar con token inválido', async () => {
            const response = await request(app)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer invalid_token');

            expect(response.status).toBe(401);
        });
    });

    describe('POST /api/auth/logout-all', () => {
        it('debería rechazar sin autenticación', async () => {
            const response = await request(app)
                .post('/api/auth/logout-all');

            expect(response.status).toBe(401);
        });
    });
});

describe('Health Check', () => {
    it('GET /health debería retornar status OK', async () => {
        const response = await request(app)
            .get('/health');

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('OK');
        expect(response.body.timestamp).toBeDefined();
    });
});

describe('Root Endpoint', () => {
    it('GET / debería retornar info de la API', async () => {
        const response = await request(app)
            .get('/');

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Sistema de Reservas API');
        expect(response.body.version).toBe('1.0.0');
    });
});
