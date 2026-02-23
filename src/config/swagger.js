const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.3',
        info: {
            title: 'Sistema de Reservas API',
            version: '1.0.0',
            description: 'API REST para la gestión de reservas de recursos (salas, escritorios, consultorios).',
            contact: {
                name: 'Rodrigo Arrue',
                url: 'https://github.com/RodriArrue'
            },
            license: {
                name: 'ISC'
            }
        },
        servers: [
            {
                url: '/api',
                description: 'API Base'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Access token JWT. Obtener vía POST /auth/login'
                },
                csrfToken: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'X-CSRF-Token',
                    description: 'Token CSRF requerido para operaciones de escritura'
                }
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        nombre: { type: 'string', example: 'Juan Pérez' },
                        email: { type: 'string', format: 'email', example: 'juan@ejemplo.com' },
                        rol: { type: 'string', enum: ['ADMIN', 'USER'], example: 'USER' },
                        activo: { type: 'boolean', example: true },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                Resource: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        nombre: { type: 'string', example: 'Sala de Reuniones A' },
                        tipo: { type: 'string', enum: ['SALA', 'ESCRITORIO', 'CONSULTORIO'], example: 'SALA' },
                        capacidad: { type: 'integer', example: 10 },
                        descripcion: { type: 'string', example: 'Sala equipada con proyector' },
                        activo: { type: 'boolean', example: true },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                Reservation: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        user_id: { type: 'string', format: 'uuid' },
                        resource_id: { type: 'string', format: 'uuid' },
                        start_time: { type: 'string', format: 'date-time' },
                        end_time: { type: 'string', format: 'date-time' },
                        status: { type: 'string', enum: ['PENDIENTE', 'CONFIRMADA', 'CANCELADA'], example: 'PENDIENTE' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                SuccessResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        data: { type: 'object' },
                        message: { type: 'string' }
                    }
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        error: { type: 'string' },
                        code: { type: 'string' }
                    }
                },
                PaginatedResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        data: {
                            type: 'object',
                            properties: {
                                rows: { type: 'array', items: {} },
                                total: { type: 'integer' },
                                page: { type: 'integer' },
                                totalPages: { type: 'integer' }
                            }
                        }
                    }
                },
                AuthTokens: {
                    type: 'object',
                    properties: {
                        accessToken: { type: 'string' },
                        refreshToken: { type: 'string' },
                        expiresAt: { type: 'string', format: 'date-time' },
                        user: { $ref: '#/components/schemas/User' }
                    }
                }
            }
        },
        tags: [
            { name: 'Auth', description: 'Autenticación y autorización' },
            { name: 'Users', description: 'Gestión de usuarios' },
            { name: 'Resources', description: 'Gestión de recursos' },
            { name: 'Reservations', description: 'Gestión de reservas' }
        ]
    },
    apis: ['./src/docs/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
