const { AuthService, AuthServiceError, AUTH_ERROR_CODES } = require('../services/AuthService');
const { UserServiceError, ERROR_CODES } = require('../services/UserService');

class AuthController {
    /**
     * POST /api/auth/register
     * Registrar un nuevo usuario
     */
    async register(req, res) {
        try {
            const { nombre, email, password } = req.body;

            // Validaciones básicas
            if (!nombre || !email || !password) {
                return res.status(400).json({
                    success: false,
                    error: 'Nombre, email y password son requeridos'
                });
            }

            if (password.length < 6) {
                return res.status(400).json({
                    success: false,
                    error: 'La contraseña debe tener al menos 6 caracteres'
                });
            }

            const result = await AuthService.register({ nombre, email, password });

            res.status(201).json({
                success: true,
                data: result,
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
            console.error('Error en registro:', error);
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

            // Validaciones básicas
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    error: 'Email y password son requeridos'
                });
            }

            const result = await AuthService.login(email, password);

            res.json({
                success: true,
                data: result,
                message: 'Login exitoso'
            });
        } catch (error) {
            if (error instanceof UserServiceError && error.code === ERROR_CODES.INVALID_CREDENTIALS) {
                return res.status(401).json({
                    success: false,
                    error: error.message,
                    code: error.code
                });
            }
            if (error instanceof AuthServiceError && error.code === AUTH_ERROR_CODES.USER_INACTIVE) {
                return res.status(403).json({
                    success: false,
                    error: error.message,
                    code: error.code
                });
            }
            console.error('Error en login:', error);
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
            // req.user es adjuntado por el middleware de autenticación
            res.json({
                success: true,
                data: req.user
            });
        } catch (error) {
            console.error('Error obteniendo perfil:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }
}

module.exports = new AuthController();
