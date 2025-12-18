const { UserService, UserServiceError, ERROR_CODES } = require('../services');

class UserController {
    async create(req, res) {
        try {
            const user = await UserService.create(req.body);
            res.status(201).json({
                success: true,
                data: user,
                message: 'Usuario creado exitosamente'
            });
        } catch (error) {
            if (error instanceof UserServiceError) {
                const statusCode = error.code === ERROR_CODES.EMAIL_DUPLICATED ? 409 : 400;
                return res.status(statusCode).json({
                    success: false,
                    error: error.message,
                    code: error.code
                });
            }
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    }

    async findAll(req, res) {
        try {
            const { page, limit, rol, activo, search } = req.query;
            const result = await UserService.findAll({
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 10,
                rol,
                activo: activo !== undefined ? activo === 'true' : undefined,
                search
            });
            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error al obtener usuarios'
            });
        }
    }

    async findById(req, res) {
        try {
            const user = await UserService.findById(req.params.id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'Usuario no encontrado'
                });
            }
            res.json({
                success: true,
                data: user
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error al obtener usuario'
            });
        }
    }

    async update(req, res) {
        try {
            const user = await UserService.update(req.params.id, req.body);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'Usuario no encontrado'
                });
            }
            res.json({
                success: true,
                data: user,
                message: 'Usuario actualizado exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error al actualizar usuario'
            });
        }
    }

    async delete(req, res) {
        try {
            await UserService.delete(req.params.id);
            res.json({
                success: true,
                message: 'Usuario eliminado exitosamente'
            });
        } catch (error) {
            if (error instanceof UserServiceError && error.code === ERROR_CODES.USER_NOT_FOUND) {
                return res.status(404).json({
                    success: false,
                    error: error.message
                });
            }
            res.status(500).json({
                success: false,
                error: 'Error al eliminar usuario'
            });
        }
    }

    async restore(req, res) {
        try {
            const user = await UserService.restore(req.params.id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'Usuario no encontrado'
                });
            }
            res.json({
                success: true,
                data: user,
                message: 'Usuario restaurado exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error al restaurar usuario'
            });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;
            const user = await UserService.verifyCredentials(email, password);
            res.json({
                success: true,
                data: user,
                message: 'Login exitoso'
            });
        } catch (error) {
            if (error instanceof UserServiceError && error.code === ERROR_CODES.INVALID_CREDENTIALS) {
                return res.status(401).json({
                    success: false,
                    error: error.message
                });
            }
            res.status(500).json({
                success: false,
                error: 'Error en el login'
            });
        }
    }

    async toggleActive(req, res) {
        try {
            const { activo } = req.body;
            const user = await UserService.toggleActive(req.params.id, activo);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'Usuario no encontrado'
                });
            }
            res.json({
                success: true,
                data: user,
                message: `Usuario ${activo ? 'activado' : 'desactivado'} exitosamente`
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error al cambiar estado del usuario'
            });
        }
    }

    async changeRole(req, res) {
        try {
            const { rol } = req.body;
            const user = await UserService.changeRole(req.params.id, rol);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'Usuario no encontrado'
                });
            }
            res.json({
                success: true,
                data: user,
                message: 'Rol actualizado exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error al cambiar rol del usuario'
            });
        }
    }
}

module.exports = new UserController();
