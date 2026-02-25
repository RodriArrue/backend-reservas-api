const { UnauthorizedError, ForbiddenError } = require('../errors/AppError');
const { User, Role, Permission } = require('../models');

/**
 * Factory de middleware para verificar roles
 * @param  {...string} allowedRoles - Roles permitidos (ej: 'admin', 'user')
 * @returns {Function} Middleware de Express
 */
const requireRole = (...allowedRoles) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: 'Usuario no autenticado',
                    code: 'UNAUTHORIZED'
                });
            }

            // Cargar roles del usuario desde la BD
            const user = await User.findByPk(req.user.id, {
                include: [{
                    model: Role,
                    as: 'roles',
                    through: { attributes: [] },
                }],
            });

            if (!user || !user.roles || user.roles.length === 0) {
                throw new ForbiddenError('Acceso denegado: sin roles asignados');
            }

            const userRoles = user.roles.map(role => role.name);
            const hasPermission = allowedRoles.some(role => userRoles.includes(role));

            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    error: `Acceso denegado. Se requiere rol: ${allowedRoles.join(' o ')}`,
                    code: 'FORBIDDEN'
                });
            }

            req.userRoles = userRoles;
            next();
        } catch (error) {
            next(error);
        }
    };
};

/**
 * Middleware para verificar permisos específicos
 * @param {string} resource - Recurso a verificar (ej: 'users', 'roles')
 * @param {string} action - Acción requerida (ej: 'create', 'read', 'update', 'delete', 'manage')
 */
const requirePermission = (resource, action) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: 'Usuario no autenticado',
                    code: 'UNAUTHORIZED'
                });
            }

            const user = await User.findByPk(req.user.id, {
                include: [{
                    model: Role,
                    as: 'roles',
                    through: { attributes: [] },
                    include: [{
                        model: Permission,
                        as: 'permissions',
                        through: { attributes: [] },
                    }],
                }],
            });

            if (!user) {
                throw new UnauthorizedError('Usuario no encontrado');
            }

            if (!user.roles || user.roles.length === 0) {
                throw new ForbiddenError('Acceso denegado: sin roles asignados');
            }

            const userPermissions = [];
            for (const role of user.roles) {
                if (role.permissions) {
                    for (const permission of role.permissions) {
                        userPermissions.push({
                            resource: permission.resource,
                            action: permission.action,
                        });
                    }
                }
            }

            const hasPermission = userPermissions.some(
                (p) =>
                    (p.resource === resource && (p.action === action || p.action === 'manage')) ||
                    (p.resource === '*' && p.action === 'manage')
            );

            if (!hasPermission) {
                throw new ForbiddenError(`Acceso denegado: permiso '${action}' sobre '${resource}' requerido`);
            }

            req.userPermissions = userPermissions;
            next();
        } catch (error) {
            next(error);
        }
    };
};

/**
 * Middleware que solo permite acceso a admins
 */
const requireAdmin = requireRole('admin');

/**
 * Middleware que permite acceso a admin o user
 */
const requireUser = requireRole('admin', 'user');

module.exports = {
    requireRole,
    requirePermission,
    requireAdmin,
    requireUser
};
