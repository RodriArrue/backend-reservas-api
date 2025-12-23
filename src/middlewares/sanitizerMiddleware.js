/**
 * Middleware de sanitización y protección adicional
 * Incluye sanitización XSS y prevención de inyección NoSQL
 */

/**
 * Sanitiza strings recursivamente en un objeto
 * Elimina caracteres peligrosos para prevenir XSS
 */
const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;

    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;')
        .replace(/\\/g, '&#x5C;')
        .replace(/`/g, '&#96;');
};

/**
 * Sanitiza recursivamente un objeto
 */
const sanitizeObject = (obj) => {
    if (obj === null || obj === undefined) return obj;

    if (typeof obj === 'string') {
        return sanitizeString(obj);
    }

    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    }

    if (typeof obj === 'object') {
        const sanitized = {};
        for (const key of Object.keys(obj)) {
            // Prevenir prototype pollution
            if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
                continue;
            }
            sanitized[sanitizeString(key)] = sanitizeObject(obj[key]);
        }
        return sanitized;
    }

    return obj;
};

/**
 * Middleware de sanitización XSS
 * Sanitiza body, query y params
 */
const xssSanitizer = (req, res, next) => {
    if (req.body) {
        req.body = sanitizeObject(req.body);
    }
    if (req.query) {
        req.query = sanitizeObject(req.query);
    }
    if (req.params) {
        req.params = sanitizeObject(req.params);
    }
    next();
};

/**
 * Middleware para prevenir NoSQL injection
 * Elimina operadores $ de los objetos
 */
const noSqlSanitizer = (req, res, next) => {
    const sanitizeNoSql = (obj) => {
        if (obj === null || obj === undefined) return obj;

        if (typeof obj === 'string') {
            // Eliminar caracteres que podrían ser usados en inyección NoSQL
            return obj.replace(/[$]/g, '');
        }

        if (Array.isArray(obj)) {
            return obj.map(item => sanitizeNoSql(item));
        }

        if (typeof obj === 'object') {
            const sanitized = {};
            for (const key of Object.keys(obj)) {
                // Prevenir operadores NoSQL
                if (key.startsWith('$')) {
                    continue;
                }
                sanitized[key] = sanitizeNoSql(obj[key]);
            }
            return sanitized;
        }

        return obj;
    };

    if (req.body) {
        req.body = sanitizeNoSql(req.body);
    }
    if (req.query) {
        req.query = sanitizeNoSql(req.query);
    }

    next();
};

module.exports = {
    xssSanitizer,
    noSqlSanitizer,
    sanitizeString,
    sanitizeObject
};
