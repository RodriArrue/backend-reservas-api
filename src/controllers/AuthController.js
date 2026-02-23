const { AuthService, AuthServiceError, AUTH_ERROR_CODES, CONFIG } = require('../services/AuthService');
const { UserServiceError, ERROR_CODES } = require('../services/UserService');
const { AuditService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const { ValidationError } = require('../utils/errors');

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
    register = catchAsync(async (req, res) => {
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
    });

    /**
     * POST /api/auth/login
     * Login de usuario
     */
    login = catchAsync(async (req, res) => {
        const { email, password } = req.body;
        const requestInfo = this.getRequestInfo(req);

        try {
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
            // Log de intento fallido antes de re-lanzar
            if (error.code === ERROR_CODES.INVALID_CREDENTIALS) {
                await AuditService.logLoginFailed(req.body.email, req, error.message);
            }
            throw error;
        }
    });

    /**
     * POST /api/auth/refresh
     * Refrescar access token usando refresh token
     */
    refresh = catchAsync(async (req, res) => {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            throw new ValidationError('Refresh token requerido', 'REFRESH_TOKEN_MISSING');
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
    });

    /**
     * POST /api/auth/logout
     * Cerrar sesión actual
     */
    logout = catchAsync(async (req, res) => {
        const authHeader = req.headers.authorization;
        const accessToken = authHeader?.split(' ')[1];
        const { refreshToken } = req.body;

        await AuthService.logout(accessToken, refreshToken);

        res.json({
            success: true,
            message: 'Sesión cerrada exitosamente'
        });
    });

    /**
     * POST /api/auth/logout-all
     * Cerrar todas las sesiones del usuario
     */
    logoutAll = catchAsync(async (req, res) => {
        await AuthService.logoutAll(req.user.id);

        res.json({
            success: true,
            message: 'Todas las sesiones han sido cerradas'
        });
    });

    /**
     * GET /api/auth/me
     * Obtener perfil del usuario autenticado
     */
    me = catchAsync(async (req, res) => {
        res.json({
            success: true,
            data: req.user
        });
    });
}

module.exports = new AuthController();
