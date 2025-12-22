/**
 * Middleware de protección CSRF
 * Valida el token en el header X-CSRF-Token
 */

const CSRF_SECRET = process.env.CSRF_SECRET || 'csrf-token-secret';

/**
 * Middleware que valida el token CSRF
 * Para operaciones críticas (POST, PUT, DELETE, PATCH)
 */
const csrfMiddleware = (req, res, next) => {
    // Solo validar en métodos que modifican datos
    const methodsToProtect = ['POST', 'PUT', 'DELETE', 'PATCH'];

    if (!methodsToProtect.includes(req.method)) {
        return next();
    }

    const token = req.headers['x-csrf-token'];

    if (!token) {
        return res.status(403).json({
            success: false,
            error: 'Token CSRF requerido',
            code: 'CSRF_MISSING'
        });
    }

    if (token !== CSRF_SECRET) {
        return res.status(403).json({
            success: false,
            error: 'Token CSRF inválido',
            code: 'CSRF_INVALID'
        });
    }

    next();
};

/**
 * Endpoint para obtener el token CSRF
 * El cliente debe llamar a este endpoint y usar el token en requests posteriores
 */
const getCsrfToken = (req, res) => {
    res.json({
        success: true,
        csrfToken: CSRF_SECRET
    });
};

module.exports = {
    csrfMiddleware,
    getCsrfToken,
    CSRF_SECRET
};
