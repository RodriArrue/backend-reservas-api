const bcrypt = require('bcrypt');
const { User, Role } = require('../models');
const { Op } = require('sequelize');
const { NotFoundError, ConflictError, BadRequestError } = require('../errors/AppError');

class UserService {
    /**
     * Crear un nuevo usuario
     * @param {Object} userData - Datos del usuario
     * @returns {Promise<User>}
     */
    async create(userData) {
        // Verificar si el email ya existe
        const existingEmail = await User.findOne({
            where: { email: userData.email },
            paranoid: false
        });

        if (existingEmail) {
            throw new ConflictError('El email ya está registrado');
        }

        // Verificar si el username ya existe
        const existingUsername = await User.findOne({
            where: { username: userData.username },
            paranoid: false
        });

        if (existingUsername) {
            throw new ConflictError('El nombre de usuario ya está en uso');
        }

        // Hashear la contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

        const user = await User.create({
            username: userData.username,
            email: userData.email,
            password: hashedPassword,
            firstName: userData.firstName,
            lastName: userData.lastName,
        });

        // Asignar roles
        if (userData.roleIds && userData.roleIds.length > 0) {
            const roles = await Role.findAll({
                where: { id: userData.roleIds },
            });
            await user.addRoles(roles);
        } else {
            const defaultRole = await Role.findOne({ where: { name: 'user' } });
            if (defaultRole) {
                await user.addRole(defaultRole);
            }
        }

        // Recargar con roles
        await user.reload({
            include: [{
                model: Role,
                as: 'roles',
                through: { attributes: [] },
            }],
        });

        return this.sanitizeUser(user);
    }

    /**
     * Obtener todos los usuarios
     * @param {Object} options - Opciones de filtrado y paginación
     * @returns {Promise<{users: User[], total: number}>}
     */
    async findAll(options = {}) {
        const { page = 1, limit = 10, activo, search, includeInactive = false } = options;
        const offset = (page - 1) * limit;

        const where = {};

        if (!includeInactive) {
            where.activo = true;
        } else if (activo !== undefined) {
            where.activo = activo;
        }

        if (search) {
            where[Op.or] = [
                { username: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } },
                { firstName: { [Op.iLike]: `%${search}%` } },
                { lastName: { [Op.iLike]: `%${search}%` } },
            ];
        }

        const { count, rows } = await User.findAndCountAll({
            where,
            include: [{
                model: Role,
                as: 'roles',
                through: { attributes: [] },
            }],
            limit,
            offset,
            attributes: { exclude: ['password'] },
            order: [['created_at', 'DESC']]
        });

        return {
            users: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit),
            },
        };
    }

    /**
     * Obtener un usuario por ID
     * @param {string} id - ID del usuario
     * @returns {Promise<User|null>}
     */
    async findById(id) {
        const user = await User.findByPk(id, {
            include: [{
                model: Role,
                as: 'roles',
                through: { attributes: [] },
            }],
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
            include: [{
                model: Role,
                as: 'roles',
                through: { attributes: [] },
            }],
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
            where: { email },
            include: [{
                model: Role,
                as: 'roles',
                through: { attributes: [] },
            }],
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
            throw new NotFoundError('Usuario no encontrado');
        }

        // Verificar duplicados de email
        if (updateData.email && updateData.email !== user.email) {
            const existingEmail = await User.findOne({
                where: { email: updateData.email },
                paranoid: false,
            });
            if (existingEmail) {
                throw new ConflictError('El email ya está registrado');
            }
        }

        // Verificar duplicados de username
        if (updateData.username && updateData.username !== user.username) {
            const existingUsername = await User.findOne({
                where: { username: updateData.username },
                paranoid: false,
            });
            if (existingUsername) {
                throw new ConflictError('El nombre de usuario ya está en uso');
            }
        }

        // Si se está actualizando la contraseña, hashearla
        if (updateData.password) {
            const saltRounds = 10;
            updateData.password = await bcrypt.hash(updateData.password, saltRounds);
            updateData.password_changed_at = new Date();
        }

        await user.update({
            username: updateData.username ?? user.username,
            email: updateData.email ?? user.email,
            firstName: updateData.firstName !== undefined ? updateData.firstName : user.firstName,
            lastName: updateData.lastName !== undefined ? updateData.lastName : user.lastName,
            ...(updateData.password ? { password: updateData.password, password_changed_at: updateData.password_changed_at } : {}),
        });

        await user.reload({
            include: [{
                model: Role,
                as: 'roles',
                through: { attributes: [] },
            }],
        });

        return this.sanitizeUser(user);
    }

    /**
     * Desactivar un usuario (soft delete mediante paranoid de Sequelize)
     * @param {string} id - ID del usuario
     * @returns {Promise<boolean>}
     */
    async delete(id) {
        const user = await User.findByPk(id);

        if (!user) {
            throw new NotFoundError('Usuario no encontrado');
        }

        await user.destroy(); // Sequelize paranoid = soft delete
        return true;
    }

    /**
     * Desactivar usuario (cambiar activo a false)
     * @param {string} id - ID del usuario
     * @param {string} currentUserId - ID del usuario actual
     * @returns {Promise<Object>}
     */
    async deactivateUser(id, currentUserId) {
        if (id === currentUserId) {
            throw new BadRequestError('No puedes desactivarte a ti mismo');
        }

        const user = await User.findByPk(id);

        if (!user) {
            throw new NotFoundError('Usuario no encontrado');
        }

        if (!user.activo) {
            throw new BadRequestError('El usuario ya está desactivado');
        }

        await user.update({ activo: false });

        return {
            id: user.id,
            username: user.username,
            email: user.email,
            activo: user.activo,
            message: 'Usuario desactivado correctamente',
        };
    }

    /**
     * Reactivar usuario
     * @param {string} id - ID del usuario
     * @returns {Promise<Object>}
     */
    async reactivateUser(id) {
        const user = await User.findByPk(id);

        if (!user) {
            throw new NotFoundError('Usuario no encontrado');
        }

        if (user.activo) {
            throw new BadRequestError('El usuario ya está activo');
        }

        await user.update({ activo: true });

        return {
            id: user.id,
            username: user.username,
            email: user.email,
            activo: user.activo,
            message: 'Usuario reactivado correctamente',
        };
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

        return this.sanitizeUser(user);
    }

    /**
     * Verificar contraseña de usuario
     * @param {string} email - Email del usuario
     * @param {string} password - Contraseña a verificar
     * @returns {Promise<User|null>}
     */
    async verifyCredentials(email, password) {
        const user = await this._findByEmailWithPassword(email);

        if (!user) {
            throw new NotFoundError('Credenciales inválidas');
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            throw new NotFoundError('Credenciales inválidas');
        }

        return this.sanitizeUser(user);
    }

    /**
     * Remover campos sensibles del usuario
     */
    sanitizeUser(user) {
        const userJson = user.toJSON();
        delete userJson.password;
        return userJson;
    }
}

module.exports = {
    UserService: new UserService(),
};
