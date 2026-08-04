#!/bin/sh
set -e

echo "🔄 Esperando a que PostgreSQL esté listo..."

# Esperar a que PostgreSQL acepte conexiones
until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -q 2>/dev/null; do
    echo "   PostgreSQL no disponible aún, reintentando en 2s..."
    sleep 2
done

echo "✅ PostgreSQL está listo"

# Ejecutar migraciones pendientes
echo "🔄 Ejecutando migraciones..."
npx sequelize-cli db:migrate --env production
echo "✅ Migraciones completadas"

# Iniciar la aplicación
echo "🚀 Iniciando la aplicación..."
exec node src/index.js
