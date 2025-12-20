const jwt = require('jsonwebtoken');
const { UserService, UserServiceError, ERROR_CODES } = require('./UserService');

// Errores personalizados para Auth
class AuthServiceError extends Error {
    constructor(message, code) {
        super(message);
        this.name = 'AuthServiceError';
        this.code = code;
    }
}

const AUTH_ERROR_CODES = {
    TOKEN_INVALID: 'TOKEN_INVALID',
    TOKEN_EXPIRED: 'TOKEN_EXPIRED',
    TOKEN_MISSING: 'TOKEN_MISSING',
    USER_INACTIVE: 'USER_INACTIVE'
};

class AuthService {
    constructor() {
        this.jwtSecret = process.env.JWT_SECRET || 'default_secret_change_in_production';
        this.jwtExpiration = process.env.JWT_EXPIRATION || '24h';
    }

    /**
     * Generar token JWT para un usuario
     * @param {Object} user - Usuario
     * @returns {string} Token JWT
     */
    generateToken(user) {
        const payload = {
            id: user.id,
            email: user.email,
            rol: user.rol
        };

        return jwt.sign(payload, this.jwtSecret, {
            expiresIn: this.jwtExpiration
        });
    }

    /**
     * Verificar y decodificar token JWT
     * @param {string} token - Token JWT
     * @returns {Object} Payload decodificado
     * @throws {AuthServiceError} Si el token es inválido o expirado
     */
    verifyToken(token) {
        if (!token) {
            throw new AuthServiceError(
                'Token no proporcionado',
                AUTH_ERROR_CODES.TOKEN_MISSING
            );
        }

        try {
            return jwt.verify(token, this.jwtSecret);
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new AuthServiceError(
                    'Token expirado',
                    AUTH_ERROR_CODES.TOKEN_EXPIRED
                );
            }
            throw new AuthServiceError(
                'Token inválido',
                AUTH_ERROR_CODES.TOKEN_INVALID
            );
        }
    }

    /**
     * Registrar un nuevo usuario
     * @param {Object} userData - Datos del usuario (nombre, email, password)
     * @returns {Promise<{user: Object, token: string}>}
     */
    async register(userData) {
        // UserService.create() ya hashea la contraseña
        const user = await UserService.create({
            nombre: userData.nombre,
            email: userData.email,
            password: userData.password,
            rol: userData.rol || 'USER' // Por defecto es USER
        });

        const token = this.generateToken(user);

        return {
            user,
            token
        };
    }

    /**
     * Login de usuario
     * @param {string} email - Email del usuario
     * @param {string} password - Contraseña
     * @returns {Promise<{user: Object, token: string}>}
     * @throws {UserServiceError} Si las credenciales son inválidas
     */
    async login(email, password) {
        // UserService.verifyCredentials() valida las credenciales
        const user = await UserService.verifyCredentials(email, password);

        // Verificar si el usuario está activo
        if (!user.activo) {
            throw new AuthServiceError(
                'Usuario inactivo',
                AUTH_ERROR_CODES.USER_INACTIVE
            );
        }

        const token = this.generateToken(user);

        return {
            user,
            token
        };
    }

    /**
     * Obtener usuario por token (para middleware)
     * @param {string} token - Token JWT
     * @returns {Promise<Object>} Usuario
     */
    async getUserFromToken(token) {
        const decoded = this.verifyToken(token);
        const user = await UserService.findById(decoded.id);

        if (!user) {
            throw new AuthServiceError(
                'Usuario no encontrado',
                AUTH_ERROR_CODES.TOKEN_INVALID
            );
        }

        return user;
    }
}

module.exports = {
    AuthService: new AuthService(),
    AuthServiceError,
    AUTH_ERROR_CODES
};
