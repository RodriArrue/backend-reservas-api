#!/bin/bash
# ============================================
# Deploy manual — Sistema de Reservas API
# ============================================
# Ejecutar desde la raíz del proyecto en EC2
#
# Uso:
#   chmod +x deploy/deploy.sh
#   ./deploy/deploy.sh

set -e

COMPOSE_FILE="docker-compose.production.yml"
ENV_FILE=".env.production"

echo "============================================"
echo "  Deploy — Sistema de Reservas API"
echo "============================================"
echo ""

# ─── Verificar que existe el archivo de entorno ───
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ No se encontró $ENV_FILE"
    echo "   Ejecutá: cp .env.production.example .env.production"
    echo "   Y completá las variables con valores reales."
    exit 1
fi

# ─── Verificar que Docker está corriendo ───
if ! docker info &> /dev/null; then
    echo "❌ Docker no está corriendo"
    echo "   Ejecutá: sudo systemctl start docker"
    exit 1
fi

# ─── Pull de cambios (si es un repo git) ───
if [ -d ".git" ]; then
    echo "🔄 Obteniendo últimos cambios del repositorio..."
    git pull origin main 2>/dev/null || git pull origin master 2>/dev/null || echo "⚠️  No se pudo hacer git pull (verificar rama)"
    echo ""
fi

# ─── Build y deploy ───
echo "🔨 Construyendo imágenes..."
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" build --no-cache
echo ""

echo "🚀 Iniciando servicios..."
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d
echo ""

# ─── Esperar a que los servicios estén saludables ───
echo "⏳ Esperando a que los servicios estén listos..."
sleep 10

# Verificar health
MAX_RETRIES=12
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -sf http://localhost/health > /dev/null 2>&1; then
        echo ""
        echo "============================================"
        echo "  ✅ Deploy exitoso"
        echo "============================================"
        echo ""
        echo "  API disponible en: http://$(curl -sf http://checkip.amazonaws.com 2>/dev/null || echo 'TU_IP_PUBLICA')"
        echo "  Health check:      http://localhost/health"
        echo "  Swagger docs:      http://localhost/api-docs"
        echo ""
        echo "  Ver logs:    docker compose --env-file $ENV_FILE -f $COMPOSE_FILE logs -f"
        echo "  Detener:     docker compose --env-file $ENV_FILE -f $COMPOSE_FILE down"
        echo "  Reiniciar:   docker compose --env-file $ENV_FILE -f $COMPOSE_FILE restart"
        echo ""
        docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" ps
        exit 0
    fi

    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "   Reintento $RETRY_COUNT/$MAX_RETRIES..."
    sleep 5
done

echo ""
echo "⚠️  Los servicios tardaron más de lo esperado en responder."
echo "   Revisá los logs: docker compose --env-file $ENV_FILE -f $COMPOSE_FILE logs -f"
echo ""
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" ps
exit 1
