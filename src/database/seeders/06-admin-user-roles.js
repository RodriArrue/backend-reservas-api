'use strict';

/**
 * Asigna el rol 'admin' a los usuarios existentes con permisos manage,
 * y asigna el rol 'user' al resto de usuarios.
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        const now = new Date();

        // --- Obtener rol admin ---
        const [roles] = await queryInterface.sequelize.query(
            "SELECT id FROM roles WHERE name = 'admin' LIMIT 1;"
        );

        if (roles.length === 0) {
            console.warn('⚠️  Rol admin no encontrado. Ejecuta el seeder de roles primero.');
            return;
        }

        const adminRoleId = roles[0].id;

        // --- Obtener rol user ---
        const [userRoles] = await queryInterface.sequelize.query(
            "SELECT id FROM roles WHERE name = 'user' LIMIT 1;"
        );

        const userRoleId = userRoles.length > 0 ? userRoles[0].id : null;

        // --- Obtener todos los usuarios ---
        const [users] = await queryInterface.sequelize.query(
            'SELECT id FROM users;'
        );

        if (users.length > 0) {
            // Asignar rol admin al primer usuario (asumimos que es el admin)
            const adminUserId = users[0].id;
            await queryInterface.bulkInsert('user_roles', [
                {
                    user_id: adminUserId,
                    role_id: adminRoleId,
                    created_at: now,
                    updated_at: now,
                },
            ]);

            // Asignar rol user al resto de usuarios
            if (userRoleId && users.length > 1) {
                const userRoleRows = users.slice(1).map((u) => ({
                    user_id: u.id,
                    role_id: userRoleId,
                    created_at: now,
                    updated_at: now,
                }));
                await queryInterface.bulkInsert('user_roles', userRoleRows);
            }
        }

        // --- Obtener permisos manage (wildcard) ---
        const [managePermissions] = await queryInterface.sequelize.query(
            "SELECT id FROM permissions WHERE action = 'manage';"
        );

        if (managePermissions.length === 0) {
            console.warn('⚠️  Permisos manage no encontrados. Ejecuta el seeder de permisos primero.');
            return;
        }

        // --- Asignar todos los permisos manage al rol admin ---
        const rolePermissions = managePermissions.map((perm) => ({
            role_id: adminRoleId,
            permission_id: perm.id,
            created_at: now,
            updated_at: now,
        }));

        await queryInterface.bulkInsert('role_permissions', rolePermissions);

        console.log('✅ Roles y permisos asignados a usuarios existentes');
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete('role_permissions', null, {});
        await queryInterface.bulkDelete('user_roles', null, {});
    },
};
