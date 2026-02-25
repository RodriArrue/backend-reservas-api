const { UserService } = require('../services');

class UserController {
    create = async (req, res, next) => {
        try {
            const { username, email, password, firstName, lastName, roleIds } = req.body;

            const user = await UserService.create({
                username,
                email,
                password,
                firstName,
                lastName,
                roleIds,
            });

            res.status(201).json({
                success: true,
                message: 'Usuario creado correctamente',
                data: user,
            });
        } catch (error) {
            next(error);
        }
    };

    findAll = async (req, res, next) => {
        try {
            const { page, limit, activo, search, includeInactive } = req.query;

            const result = await UserService.findAll({
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 10,
                activo: activo !== undefined ? activo === 'true' : undefined,
                includeInactive: includeInactive === 'true',
                search
            });

            res.json({
                success: true,
                data: result.users,
                pagination: result.pagination,
            });
        } catch (error) {
            next(error);
        }
    };

    findById = async (req, res, next) => {
        try {
            const user = await UserService.findById(req.params.id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado',
                });
            }
            res.json({
                success: true,
                data: user
            });
        } catch (error) {
            next(error);
        }
    };

    update = async (req, res, next) => {
        try {
            const { username, email, firstName, lastName } = req.body;

            const user = await UserService.update(req.params.id, {
                username,
                email,
                firstName,
                lastName,
            });

            res.json({
                success: true,
                data: user,
                message: 'Usuario actualizado exitosamente'
            });
        } catch (error) {
            next(error);
        }
    };

    delete = async (req, res, next) => {
        try {
            await UserService.delete(req.params.id);
            res.json({
                success: true,
                message: 'Usuario eliminado exitosamente'
            });
        } catch (error) {
            next(error);
        }
    };

    restore = async (req, res, next) => {
        try {
            const user = await UserService.restore(req.params.id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado',
                });
            }
            res.json({
                success: true,
                data: user,
                message: 'Usuario restaurado exitosamente'
            });
        } catch (error) {
            next(error);
        }
    };

    deactivate = async (req, res, next) => {
        try {
            const currentUserId = req.user.id;
            const result = await UserService.deactivateUser(req.params.id, currentUserId);

            res.json({
                success: true,
                message: result.message,
                data: {
                    id: result.id,
                    username: result.username,
                    email: result.email,
                    activo: result.activo,
                },
            });
        } catch (error) {
            next(error);
        }
    };

    reactivate = async (req, res, next) => {
        try {
            const result = await UserService.reactivateUser(req.params.id);

            res.json({
                success: true,
                message: result.message,
                data: {
                    id: result.id,
                    username: result.username,
                    email: result.email,
                    activo: result.activo,
                },
            });
        } catch (error) {
            next(error);
        }
    };
}

module.exports = new UserController();
