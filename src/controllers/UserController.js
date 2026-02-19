const { UserService, UserServiceError, ERROR_CODES } = require('../services');
const catchAsync = require('../utils/catchAsync');
const { NotFoundError } = require('../utils/errors');

class UserController {
    create = catchAsync(async (req, res) => {
        const user = await UserService.create(req.body);
        res.status(201).json({
            success: true,
            data: user,
            message: 'Usuario creado exitosamente'
        });
    });

    findAll = catchAsync(async (req, res) => {
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
    });

    findById = catchAsync(async (req, res) => {
        const user = await UserService.findById(req.params.id);
        if (!user) {
            throw new NotFoundError('Usuario');
        }
        res.json({
            success: true,
            data: user
        });
    });

    update = catchAsync(async (req, res) => {
        const user = await UserService.update(req.params.id, req.body);
        if (!user) {
            throw new NotFoundError('Usuario');
        }
        res.json({
            success: true,
            data: user,
            message: 'Usuario actualizado exitosamente'
        });
    });

    delete = catchAsync(async (req, res) => {
        await UserService.delete(req.params.id);
        res.json({
            success: true,
            message: 'Usuario eliminado exitosamente'
        });
    });

    restore = catchAsync(async (req, res) => {
        const user = await UserService.restore(req.params.id);
        if (!user) {
            throw new NotFoundError('Usuario');
        }
        res.json({
            success: true,
            data: user,
            message: 'Usuario restaurado exitosamente'
        });
    });

    login = catchAsync(async (req, res) => {
        const { email, password } = req.body;
        const user = await UserService.verifyCredentials(email, password);
        res.json({
            success: true,
            data: user,
            message: 'Login exitoso'
        });
    });

    toggleActive = catchAsync(async (req, res) => {
        const { activo } = req.body;
        const user = await UserService.toggleActive(req.params.id, activo);
        if (!user) {
            throw new NotFoundError('Usuario');
        }
        res.json({
            success: true,
            data: user,
            message: `Usuario ${activo ? 'activado' : 'desactivado'} exitosamente`
        });
    });

    changeRole = catchAsync(async (req, res) => {
        const { rol } = req.body;
        const user = await UserService.changeRole(req.params.id, rol);
        if (!user) {
            throw new NotFoundError('Usuario');
        }
        res.json({
            success: true,
            data: user,
            message: 'Rol actualizado exitosamente'
        });
    });
}

module.exports = new UserController();
