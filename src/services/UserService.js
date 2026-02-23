const bcrypt = require('bcrypt');
const { User } = require('../models');
const { Op } = require('sequelize');

// Errores personalizados
class UserServiceError extends Error {
    constructor(message, code) {
        super(message);
        this.name = 'UserServiceError';
        this.code = code;
    }
}

const ERROR_CODES = {
    EMAIL_DUPLICATED: 'EMAIL_DUPLICATED',
    USER_NOT_FOUND: 'USER_NOT_FOUND',
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
    VALIDATION_ERROR: 'VALIDATION_ERROR'
};

class UserService {
    /**
     * Crear un nuevo usuario
     * @param {Object} userData - Datos del usuario
     * @returns {Promise<User>}
     */
    async create(userData) {
        // Verificar si el email ya existe
        const existingUser = await User.findOne({
            where: { email: userData.email },
            paranoid: false // Incluir usuarios eliminados
        });

        if (existingUser) {
            throw new UserServiceError(
                'El email ya está registrado',
                ERROR_CODES.EMAIL_DUPLICATED
            );
        }

        // Hashear la contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

        const user = await User.create({
            ...userData,
            password: hashedPassword
        });

        // Retornar usuario sin la contraseña
        const userJson = user.toJSON();
        delete userJson.password;
        return userJson;
    }

    /**
     * Obtener todos los usuarios
     * @param {Object} options - Opciones de filtrado y paginación
     * @returns {Promise<{users: User[], total: number}>}
     */
    async findAll(options = {}) {
        const { page = 1, limit = 10, rol, activo, search } = options;
        const offset = (page - 1) * limit;

        const where = {};

        if (rol) {
            where.rol = rol;
        }

        if (activo !== undefined) {
            where.activo = activo;
        }

        if (search) {
            where[Op.or] = [
                { nombre: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const { count, rows } = await User.findAndCountAll({
            where,
            limit,
            offset,
            attributes: { exclude: ['password'] },
            order: [['created_at', 'DESC']]
        });

        return {
            users: rows,
            total: count,
            page,
            totalPages: Math.ceil(count / limit)
        };
    }

    /**
     * Obtener un usuario por ID
     * @param {string} id - ID del usuario
     * @returns {Promise<User|null>}
     */
    async findById(id) {
        const user = await User.findByPk(id, {
            attributes: { exclude: ['password'] }
        });
        return user;
    }

    /**
     * Obtener un usuario por email (sin password)
     * @param {string} email - Email del usuario
     * @returns {Promise<User|null>}
     */
    async findByEmail(email) {
        const user = await User.findOne({
            where: { email },
            attributes: { exclude: ['password'] }
        });
        return user;
    }

    /**
     * Obtener un usuario por email CON password (solo para autenticación interna)
     * @param {string} email - Email del usuario
     * @returns {Promise<User|null>}
     * @private
     */
    async _findByEmailWithPassword(email) {
        const user = await User.findOne({
            where: { email }
        });
        return user;
    }

    /**
     * Actualizar un usuario
     * @param {string} id - ID del usuario
     * @param {Object} updateData - Datos a actualizar
     * @returns {Promise<User|null>}
     */
    async update(id, updateData) {
        const user = await User.findByPk(id);

        if (!user) {
            return null;
        }

        // Si se está actualizando la contraseña, hashearla
        if (updateData.password) {
            const saltRounds = 10;
            updateData.password = await bcrypt.hash(updateData.password, saltRounds);
        }

        await user.update(updateData);

        const userJson = user.toJSON();
        delete userJson.password;
        return userJson;
    }

    /**
     * Desactivar un usuario (soft delete mediante paranoid de Sequelize)
     * @param {string} id - ID del usuario
     * @returns {Promise<boolean>}
     * @throws {UserServiceError} Si el usuario no existe
     */
    async delete(id) {
        const user = await User.findByPk(id);

        if (!user) {
            throw new UserServiceError(
                'Usuario no encontrado',
                ERROR_CODES.USER_NOT_FOUND
            );
        }

        await user.destroy(); // Sequelize paranoid = soft delete
        return true;
    }

    /**
     * Restaurar un usuario eliminado
     * @param {string} id - ID del usuario
     * @returns {Promise<User|null>}
     */
    async restore(id) {
        const user = await User.findByPk(id, { paranoid: false });

        if (!user) {
            return null;
        }

        await user.restore();

        const userJson = user.toJSON();
        delete userJson.password;
        return userJson;
    }

    /**
     * Verificar contraseña de usuario
     * @param {string} email - Email del usuario
     * @param {string} password - Contraseña a verificar
     * @returns {Promise<User|null>}
     * @throws {UserServiceError} Si las credenciales son inválidas
     */
    async verifyCredentials(email, password) {
        const user = await this._findByEmailWithPassword(email);

        if (!user) {
            throw new UserServiceError(
                'Credenciales inválidas',
                ERROR_CODES.INVALID_CREDENTIALS
            );
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            throw new UserServiceError(
                'Credenciales inválidas',
                ERROR_CODES.INVALID_CREDENTIALS
            );
        }

        const userJson = user.toJSON();
        delete userJson.password;
        return userJson;
    }

    /**
     * Cambiar el estado activo de un usuario
     * @param {string} id - ID del usuario
     * @param {boolean} activo - Nuevo estado
     * @returns {Promise<User|null>}
     */
    async toggleActive(id, activo) {
        return this.update(id, { activo });
    }

    /**
     * Cambiar el rol de un usuario
     * @param {string} id - ID del usuario
     * @param {string} rol - Nuevo rol
     * @returns {Promise<User|null>}
     */
    async changeRole(id, rol) {
        return this.update(id, { rol });
    }
}

module.exports = {
    UserService: new UserService(),
    UserServiceError,
    ERROR_CODES
};
