/**
 * Factory de middleware para verificar roles
 * @param  {...string} allowedRoles - Roles permitidos (ej: 'ADMIN', 'USER')
 * @returns {Function} Middleware de Express
 */
const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        // Este middleware debe usarse DESPUÉS del authMiddleware
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Usuario no autenticado',
                code: 'UNAUTHORIZED'
            });
        }

        const userRole = req.user.rol;

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                error: `Acceso denegado. Se requiere rol: ${allowedRoles.join(' o ')}`,
                code: 'FORBIDDEN'
            });
        }

        next();
    };
};

/**
 * Middleware que solo permite acceso a ADMIN
 */
const requireAdmin = requireRole('ADMIN');

/**
 * Middleware que permite acceso a ADMIN o USER
 */
const requireUser = requireRole('ADMIN', 'USER');

module.exports = {
    requireRole,
    requireAdmin,
    requireUser
};
