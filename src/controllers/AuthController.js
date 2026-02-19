const { AuthService, AuthServiceError, AUTH_ERROR_CODES, CONFIG } = require('../services/AuthService');
const { UserServiceError, ERROR_CODES } = require('../services/UserService');
const { AuditService } = require('../services');
const logger = require('../utils/logger');

class AuthController {
    /**
     * Helper para obtener info del request
     */
    getRequestInfo(req) {
        return {
            ip: req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || req.ip,
            userAgent: req.headers['user-agent']
        };
    }

    /**
     * POST /api/auth/register
     * Registrar un nuevo usuario
     */
    async register(req, res) {
        try {
            const { nombre, email, password, rol } = req.body;
            const requestInfo = this.getRequestInfo(req);

            const result = await AuthService.register({ nombre, email, password, rol }, requestInfo);

            // Log de auditoría
            await AuditService.logCreate(result.user.id, 'USER', result.user.id, { nombre, email, rol }, req);

            res.status(201).json({
                success: true,
                data: {
                    user: result.user,
                    accessToken: result.accessToken,
                    refreshToken: result.refreshToken,
                    expiresAt: result.expiresAt
                },
                message: 'Usuario registrado exitosamente'
            });
        } catch (error) {
            if (error instanceof UserServiceError) {
                const statusCode = error.code === ERROR_CODES.EMAIL_DUPLICATED ? 409 : 400;
                return res.status(statusCode).json({
                    success: false,
                    error: error.message,
                    code: error.code
                });
            }
            logger.error('Error en registro:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }

    /**
     * POST /api/auth/login
     * Login de usuario
     */
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const requestInfo = this.getRequestInfo(req);

            const result = await AuthService.login(email, password, requestInfo);

            // Log de auditoría
            await AuditService.logLogin(result.user.id, req);

            res.json({
                success: true,
                data: {
                    user: result.user,
                    accessToken: result.accessToken,
                    refreshToken: result.refreshToken,
                    expiresAt: result.expiresAt
                },
                message: 'Login exitoso'
            });
        } catch (error) {
            // Log de intento fallido
            if (error.code === ERROR_CODES.INVALID_CREDENTIALS) {
                await AuditService.logLoginFailed(req.body.email, req, error.message);
            }

            if (error instanceof UserServiceError && error.code === ERROR_CODES.INVALID_CREDENTIALS) {
                return res.status(401).json({
                    success: false,
                    error: error.message,
                    code: error.code
                });
            }
            if (error instanceof AuthServiceError) {
                const statusCode = error.code === AUTH_ERROR_CODES.ACCOUNT_LOCKED ? 423 : 403;
                return res.status(statusCode).json({
                    success: false,
                    error: error.message,
                    code: error.code
                });
            }
            logger.error('Error en login:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }

    /**
     * POST /api/auth/refresh
     * Refrescar access token usando refresh token
     */
    async refresh(req, res) {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                return res.status(400).json({
                    success: false,
                    error: 'Refresh token requerido',
                    code: 'REFRESH_TOKEN_MISSING'
                });
            }

            const requestInfo = this.getRequestInfo(req);
            const result = await AuthService.refresh(refreshToken, requestInfo);

            res.json({
                success: true,
                data: {
                    accessToken: result.accessToken,
                    refreshToken: result.refreshToken,
                    expiresAt: result.expiresAt
                },
                message: 'Token refrescado exitosamente'
            });
        } catch (error) {
            if (error instanceof AuthServiceError) {
                const statusCode =
                    error.code === AUTH_ERROR_CODES.REFRESH_TOKEN_EXPIRED ? 401 :
                        error.code === AUTH_ERROR_CODES.REFRESH_TOKEN_REVOKED ? 401 : 400;
                return res.status(statusCode).json({
                    success: false,
                    error: error.message,
                    code: error.code
                });
            }
            logger.error('Error en refresh:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }

    /**
     * POST /api/auth/logout
     * Cerrar sesión actual
     */
    async logout(req, res) {
        try {
            const authHeader = req.headers.authorization;
            const accessToken = authHeader?.split(' ')[1];
            const { refreshToken } = req.body;

            await AuthService.logout(accessToken, refreshToken);

            res.json({
                success: true,
                message: 'Sesión cerrada exitosamente'
            });
        } catch (error) {
            logger.error('Error en logout:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }

    /**
     * POST /api/auth/logout-all
     * Cerrar todas las sesiones del usuario
     */
    async logoutAll(req, res) {
        try {
            await AuthService.logoutAll(req.user.id);

            res.json({
                success: true,
                message: 'Todas las sesiones han sido cerradas'
            });
        } catch (error) {
            logger.error('Error en logout-all:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }

    /**
     * GET /api/auth/me
     * Obtener perfil del usuario autenticado
     */
    async me(req, res) {
        try {
            res.json({
                success: true,
                data: req.user
            });
        } catch (error) {
            logger.error('Error obteniendo perfil:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }
}

module.exports = new AuthController();
