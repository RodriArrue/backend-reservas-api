'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Agregar columna username
        await queryInterface.addColumn('users', 'username', {
            type: Sequelize.STRING(50),
            allowNull: true, // temporalmente nullable para datos existentes
            unique: true,
        });

        // Agregar columna first_name
        await queryInterface.addColumn('users', 'first_name', {
            type: Sequelize.STRING(50),
            allowNull: true,
        });

        // Agregar columna last_name
        await queryInterface.addColumn('users', 'last_name', {
            type: Sequelize.STRING(50),
            allowNull: true,
        });

        // Migrar datos existentes: usar 'nombre' como username si no existe
        await queryInterface.sequelize.query(`
            UPDATE users
            SET username = LOWER(REPLACE(REPLACE(nombre, ' ', '_'), '.', '_')) || '_' || SUBSTRING(id::text, 1, 4)
            WHERE username IS NULL;
        `);

        // Migrar nombre a first_name
        await queryInterface.sequelize.query(`
            UPDATE users
            SET first_name = nombre
            WHERE first_name IS NULL AND nombre IS NOT NULL;
        `);

        // Hacer username NOT NULL después de migrar datos
        await queryInterface.changeColumn('users', 'username', {
            type: Sequelize.STRING(50),
            allowNull: false,
            unique: true,
        });

        // Eliminar columna 'rol' (ENUM)
        await queryInterface.removeColumn('users', 'rol');

        // Eliminar columna 'nombre' (reemplazada por first_name + last_name)
        await queryInterface.removeColumn('users', 'nombre');

        // Eliminar el tipo ENUM huérfano
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_rol";');

        // Agregar índice para username
        await queryInterface.addIndex('users', ['username'], {
            where: { deletedAt: null },
        });
    },

    async down(queryInterface, Sequelize) {
        // Restaurar columna 'nombre' desde first_name
        await queryInterface.addColumn('users', 'nombre', {
            type: Sequelize.STRING(100),
            allowNull: true,
        });

        await queryInterface.sequelize.query(`
            UPDATE users SET nombre = first_name WHERE nombre IS NULL;
        `);

        await queryInterface.changeColumn('users', 'nombre', {
            type: Sequelize.STRING(100),
            allowNull: false,
        });

        // Restaurar columna 'rol'
        await queryInterface.addColumn('users', 'rol', {
            type: Sequelize.ENUM('ADMIN', 'USER'),
            defaultValue: 'USER',
            allowNull: false,
        });

        // Eliminar nuevas columnas
        await queryInterface.removeColumn('users', 'username');
        await queryInterface.removeColumn('users', 'first_name');
        await queryInterface.removeColumn('users', 'last_name');
    },
};
