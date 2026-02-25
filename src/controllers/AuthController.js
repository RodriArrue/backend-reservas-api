const { AuthService } = require('../services/AuthService');
const catchAsync = require('../utils/catchAsync');

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
        const { username, email, password, firstName, lastName } = req.body;
        const requestInfo = this.getRequestInfo(req);

        const result = await AuthService.register({
            username, email, password, firstName, lastName
        }, requestInfo);

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

        const result = await AuthService.login(email, password, requestInfo);

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
    });

    /**
     * POST /api/auth/refresh
     * Refrescar access token usando refresh token
     */
    refresh = catchAsync(async (req, res) => {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                error: 'Refresh token requerido'
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
        const user = await AuthService.getUserById(req.user.id);

        res.json({
            success: true,
            data: user
        });
    });

    /**
     * PATCH /api/auth/change-password
     * Cambiar contraseña del usuario autenticado
     */
    changePassword = catchAsync(async (req, res) => {
        const { currentPassword, newPassword } = req.body;

        const result = await AuthService.changePassword(req.user.id, {
            currentPassword,
            newPassword,
        });

        res.json({
            success: true,
            message: result.message,
        });
    });
}

module.exports = new AuthController();
