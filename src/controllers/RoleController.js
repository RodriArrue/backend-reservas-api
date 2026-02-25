const RoleService = require('../services/RoleService');

class RoleController {
    /**
     * GET /api/roles
     */
    async getAll(req, res, next) {
        try {
            const { page, limit, search } = req.query;

            const result = await RoleService.getAllRoles({
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 10,
                search,
            });

            res.status(200).json({
                success: true,
                data: result.roles,
                pagination: result.pagination,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/roles/:id
     */
    async getById(req, res, next) {
        try {
            const role = await RoleService.getRoleById(req.params.id);

            res.status(200).json({
                success: true,
                data: role,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/roles
     */
    async create(req, res, next) {
        try {
            const { name, description, isActive } = req.body;

            const role = await RoleService.createRole({
                name,
                description,
                isActive,
            });

            res.status(201).json({
                success: true,
                message: 'Rol creado exitosamente',
                data: role,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PUT /api/roles/:id
     */
    async update(req, res, next) {
        try {
            const { name, description, isActive } = req.body;

            const role = await RoleService.updateRole(req.params.id, {
                name,
                description,
                isActive,
            });

            res.status(200).json({
                success: true,
                message: 'Rol actualizado exitosamente',
                data: role,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /api/roles/:id
     */
    async delete(req, res, next) {
        try {
            const result = await RoleService.deleteRole(req.params.id);

            res.status(200).json({
                success: true,
                message: result.message,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/roles/assign
     */
    async assignToUser(req, res, next) {
        try {
            const { userId, roleId } = req.body;

            const result = await RoleService.assignRoleToUser(userId, roleId);

            res.status(200).json({
                success: true,
                message: result.message,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/roles/remove
     */
    async removeFromUser(req, res, next) {
        try {
            const { userId, roleId } = req.body;

            const result = await RoleService.removeRoleFromUser(userId, roleId);

            res.status(200).json({
                success: true,
                message: result.message,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/roles/user/:userId
     */
    async getUserRoles(req, res, next) {
        try {
            const roles = await RoleService.getUserRoles(req.params.userId);

            res.status(200).json({
                success: true,
                data: roles,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/roles/:roleId/users
     */
    async getRoleUsers(req, res, next) {
        try {
            const users = await RoleService.getRoleUsers(req.params.roleId);

            res.status(200).json({
                success: true,
                data: users,
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new RoleController();
