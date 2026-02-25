const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { UserService } = require('./UserService');
const { User, Role, RefreshToken, TokenBlacklist } = require('../models');
const { UnauthorizedError, NotFoundError } = require('../errors/AppError');

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
    TOKEN_BLACKLISTED: 'TOKEN_BLACKLISTED',
    REFRESH_TOKEN_INVALID: 'REFRESH_TOKEN_INVALID',
    REFRESH_TOKEN_EXPIRED: 'REFRESH_TOKEN_EXPIRED',
    REFRESH_TOKEN_REVOKED: 'REFRESH_TOKEN_REVOKED',
    USER_INACTIVE: 'USER_INACTIVE',
    ACCOUNT_LOCKED: 'ACCOUNT_LOCKED'
};

// Configuración
const CONFIG = {
    ACCESS_TOKEN_EXPIRATION: '15m', // 15 minutos
    REFRESH_TOKEN_EXPIRATION_DAYS: 7, // 7 días
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION_MINUTES: 15
};

class AuthService {
    constructor() {
        this.jwtSecret = process.env.JWT_SECRET || 'default_secret_change_in_production';
        this.refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || 'refresh_secret_change_in_production';
    }

    /**
     * Generar un JTI (JWT ID) único
     */
    generateJti() {
        return crypto.randomBytes(16).toString('hex');
    }

    /**
     * Generar access token JWT (corta duración)
     * @param {Object} user - Usuario
     * @returns {Object} { token, jti, expiresAt }
     */
    generateAccessToken(user) {
        const jti = this.generateJti();
        const expiresIn = CONFIG.ACCESS_TOKEN_EXPIRATION;

        const payload = {
            id: user.id,
            email: user.email,
            username: user.username,
            jti
        };

        const token = jwt.sign(payload, this.jwtSecret, { expiresIn });

        // Calcular fecha de expiración
        const decoded = jwt.decode(token);
        const expiresAt = new Date(decoded.exp * 1000);

        return { token, jti, expiresAt };
    }

    /**
     * Generar refresh token (larga duración)
     * @param {Object} user - Usuario
     * @param {string} accessTokenJti - JTI del access token asociado
     * @param {Object} requestInfo - IP y user agent
     * @returns {Promise<Object>} { token, expiresAt }
     */
    async generateRefreshToken(user, accessTokenJti, requestInfo = {}) {
        const token = RefreshToken.generateToken();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + CONFIG.REFRESH_TOKEN_EXPIRATION_DAYS);

        await RefreshToken.create({
            user_id: user.id,
            token,
            access_token_jti: accessTokenJti,
            expires_at: expiresAt,
            ip_address: requestInfo.ip || null,
            user_agent: requestInfo.userAgent || null
        });

        return { token, expiresAt };
    }

    /**
     * Verificar y decodificar access token
     * @param {string} token - Token JWT
     * @returns {Object} Payload decodificado
     */
    async verifyAccessToken(token) {
        if (!token) {
            throw new AuthServiceError('Token no proporcionado', AUTH_ERROR_CODES.TOKEN_MISSING);
        }

        try {
            const decoded = jwt.verify(token, this.jwtSecret);

            // Verificar si el token está en blacklist
            const isBlacklisted = await TokenBlacklist.isBlacklisted(decoded.jti);
            if (isBlacklisted) {
                throw new AuthServiceError('Token revocado', AUTH_ERROR_CODES.TOKEN_BLACKLISTED);
            }

            return decoded;
        } catch (error) {
            if (error instanceof AuthServiceError) throw error;

            if (error.name === 'TokenExpiredError') {
                throw new AuthServiceError('Token expirado', AUTH_ERROR_CODES.TOKEN_EXPIRED);
            }
            throw new AuthServiceError('Token inválido', AUTH_ERROR_CODES.TOKEN_INVALID);
        }
    }

    /**
     * Verificar cuenta bloqueada
     */
    checkAccountLockout(user) {
        if (user.locked_until && new Date(user.locked_until) > new Date()) {
            const remainingMinutes = Math.ceil((new Date(user.locked_until) - new Date()) / 60000);
            throw new AuthServiceError(
                `Cuenta bloqueada. Intenta nuevamente en ${remainingMinutes} minuto(s)`,
                AUTH_ERROR_CODES.ACCOUNT_LOCKED
            );
        }
    }

    /**
     * Registrar intento fallido de login
     */
    async recordFailedLogin(user) {
        const attempts = user.failed_login_attempts + 1;
        const updateData = { failed_login_attempts: attempts };

        if (attempts >= CONFIG.MAX_LOGIN_ATTEMPTS) {
            const lockUntil = new Date();
            lockUntil.setMinutes(lockUntil.getMinutes() + CONFIG.LOCKOUT_DURATION_MINUTES);
            updateData.locked_until = lockUntil;
        }

        await User.update(updateData, { where: { id: user.id } });

        return attempts;
    }

    /**
     * Resetear contador de intentos fallidos
     */
    async resetFailedLogins(user) {
        await User.update({
            failed_login_attempts: 0,
            locked_until: null,
            last_login: new Date()
        }, { where: { id: user.id } });
    }

    /**
     * Registrar un nuevo usuario
     */
    async register(userData, requestInfo = {}) {
        const user = await UserService.create({
            username: userData.username,
            email: userData.email,
            password: userData.password,
            firstName: userData.firstName,
            lastName: userData.lastName,
            roleIds: userData.roleIds,
        });

        const { token: accessToken, jti, expiresAt: accessExpiresAt } = this.generateAccessToken(user);
        const { token: refreshToken } = await this.generateRefreshToken(user, jti, requestInfo);

        return {
            user,
            accessToken,
            refreshToken,
            expiresAt: accessExpiresAt
        };
    }

    /**
     * Login de usuario
     */
    async login(email, password, requestInfo = {}) {
        // Buscar usuario (incluyendo bloqueados)
        const user = await User.findOne({
            where: { email, activo: true },
            include: [{
                model: Role,
                as: 'roles',
                through: { attributes: [] },
            }],
            attributes: { include: ['password', 'failed_login_attempts', 'locked_until'] }
        });

        if (!user) {
            throw new UnauthorizedError('Credenciales inválidas');
        }

        // Verificar bloqueo
        await this.checkAccountLockout(user);

        // Verificar contraseña
        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            const attempts = await this.recordFailedLogin(user);
            const remaining = CONFIG.MAX_LOGIN_ATTEMPTS - attempts;

            if (remaining > 0) {
                throw new UnauthorizedError(
                    `Credenciales inválidas. Te quedan ${remaining} intento(s)`
                );
            } else {
                throw new AuthServiceError(
                    `Cuenta bloqueada por ${CONFIG.LOCKOUT_DURATION_MINUTES} minutos`,
                    AUTH_ERROR_CODES.ACCOUNT_LOCKED
                );
            }
        }

        // Login exitoso - resetear contador
        await this.resetFailedLogins(user);

        // Generar tokens
        const { token: accessToken, jti, expiresAt: accessExpiresAt } = this.generateAccessToken(user);
        const { token: refreshToken } = await this.generateRefreshToken(user, jti, requestInfo);

        // Limpiar datos sensibles
        const userResponse = user.toJSON();
        delete userResponse.password;
        delete userResponse.failed_login_attempts;
        delete userResponse.locked_until;

        return {
            user: userResponse,
            accessToken,
            refreshToken,
            expiresAt: accessExpiresAt
        };
    }

    /**
     * Refrescar access token
     */
    async refresh(refreshTokenValue, requestInfo = {}) {
        const refreshTokenRecord = await RefreshToken.findOne({
            where: { token: refreshTokenValue },
            include: [{
                model: User,
                as: 'user',
                include: [{
                    model: Role,
                    as: 'roles',
                    through: { attributes: [] },
                }],
            }]
        });

        if (!refreshTokenRecord) {
            throw new AuthServiceError('Refresh token inválido', AUTH_ERROR_CODES.REFRESH_TOKEN_INVALID);
        }

        if (refreshTokenRecord.revoked) {
            throw new AuthServiceError('Refresh token revocado', AUTH_ERROR_CODES.REFRESH_TOKEN_REVOKED);
        }

        if (new Date(refreshTokenRecord.expires_at) < new Date()) {
            throw new AuthServiceError('Refresh token expirado', AUTH_ERROR_CODES.REFRESH_TOKEN_EXPIRED);
        }

        const user = refreshTokenRecord.user;
        if (!user || !user.activo) {
            throw new AuthServiceError('Usuario inactivo', AUTH_ERROR_CODES.USER_INACTIVE);
        }

        // Revocar el refresh token anterior (rotation)
        await refreshTokenRecord.update({ revoked: true, revoked_at: new Date() });

        // Generar nuevos tokens
        const { token: accessToken, jti, expiresAt: accessExpiresAt } = this.generateAccessToken(user);
        const { token: newRefreshToken } = await this.generateRefreshToken(user, jti, requestInfo);

        return {
            accessToken,
            refreshToken: newRefreshToken,
            expiresAt: accessExpiresAt
        };
    }

    /**
     * Logout - invalidar tokens actuales
     */
    async logout(accessToken, refreshTokenValue = null) {
        const decoded = jwt.decode(accessToken);

        if (decoded && decoded.jti) {
            // Añadir access token a blacklist
            await TokenBlacklist.create({
                token_jti: decoded.jti,
                user_id: decoded.id,
                expires_at: new Date(decoded.exp * 1000),
                reason: 'LOGOUT'
            });
        }

        // Revocar refresh token si se proporciona
        if (refreshTokenValue) {
            await RefreshToken.update(
                { revoked: true, revoked_at: new Date() },
                { where: { token: refreshTokenValue } }
            );
        }

        return true;
    }

    /**
     * Logout de todas las sesiones
     */
    async logoutAll(userId) {
        // Revocar todos los refresh tokens del usuario
        await RefreshToken.update(
            { revoked: true, revoked_at: new Date() },
            { where: { user_id: userId, revoked: false } }
        );

        return true;
    }

    /**
     * Cambiar contraseña del usuario autenticado
     */
    async changePassword(userId, { currentPassword, newPassword }) {
        const user = await User.findByPk(userId);

        if (!user) {
            throw new NotFoundError('Usuario no encontrado');
        }

        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) {
            throw new UnauthorizedError('La contraseña actual es incorrecta');
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        await user.update({
            password: hashedPassword,
            password_changed_at: new Date()
        });

        return { message: 'Contraseña actualizada correctamente' };
    }

    /**
     * Obtener usuario por token (para middleware)
     */
    async getUserFromToken(token) {
        const decoded = await this.verifyAccessToken(token);
        const user = await UserService.findById(decoded.id);

        if (!user) {
            throw new AuthServiceError('Usuario no encontrado', AUTH_ERROR_CODES.TOKEN_INVALID);
        }

        // Verificar si la contraseña cambió después de generar el token
        if (user.password_changed_at) {
            const tokenIssuedAt = new Date(decoded.iat * 1000);
            if (user.password_changed_at > tokenIssuedAt) {
                throw new AuthServiceError(
                    'La contraseña fue cambiada. Por favor inicia sesión nuevamente',
                    AUTH_ERROR_CODES.TOKEN_INVALID
                );
            }
        }

        return user;
    }

    /**
     * Obtener usuario por ID (sin contraseña, con roles)
     */
    async getUserById(id) {
        const user = await User.findByPk(id, {
            include: [{
                model: Role,
                as: 'roles',
                through: { attributes: [] },
            }],
            attributes: { exclude: ['password'] },
        });

        if (!user) {
            throw new NotFoundError('Usuario no encontrado');
        }

        const userJson = user.toJSON();
        delete userJson.password;
        return userJson;
    }

    // Compatibilidad con código existente
    generateToken(user) {
        return this.generateAccessToken(user).token;
    }

    verifyToken(token) {
        return this.verifyAccessToken(token);
    }
}

module.exports = {
    AuthService: new AuthService(),
    AuthServiceError,
    AUTH_ERROR_CODES,
    CONFIG
};
