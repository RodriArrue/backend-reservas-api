const { AuthService, AuthServiceError } = require('../services/AuthService');
const logger = require('../utils/logger');

/**
 * Middleware de autenticación JWT
 * Extrae el token del header Authorization y valida
 * Adjunta req.user con los datos del usuario
 */
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                error: 'Token no proporcionado',
                code: 'TOKEN_MISSING'
            });
        }

        // Formato esperado: "Bearer <token>"
        const parts = authHeader.split(' ');

        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(401).json({
                success: false,
                error: 'Formato de token inválido. Use: Bearer <token>',
                code: 'TOKEN_INVALID'
            });
        }

        const token = parts[1];

        // Obtener usuario desde el token
        const user = await AuthService.getUserFromToken(token);

        // Adjuntar usuario al request
        req.user = user;
        req.token = token;

        next();
    } catch (error) {
        if (error instanceof AuthServiceError) {
            const statusCode = error.code === 'TOKEN_EXPIRED' ? 401 : 401;
            return res.status(statusCode).json({
                success: false,
                error: error.message,
                code: error.code
            });
        }
        logger.error('Error en authMiddleware:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
};

module.exports = authMiddleware;
