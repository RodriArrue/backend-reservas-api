#!/bin/bash
# ============================================
# Setup inicial de instancia EC2
# ============================================
# Ejecutar como root o con sudo en una instancia EC2 nueva
# Compatible con: Ubuntu 22.04/24.04 y Amazon Linux 2023
#
# Uso:
#   chmod +x deploy/setup-ec2.sh
#   sudo ./deploy/setup-ec2.sh

set -e

echo "============================================"
echo "  Setup EC2 — Sistema de Reservas API"
echo "============================================"
echo ""

# ─── Detectar distribución ───
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
else
    echo "❌ No se pudo detectar el sistema operativo"
    exit 1
fi

echo "📦 Sistema detectado: $OS $VERSION_ID"
echo ""

# ─── Actualizar sistema ───
echo "🔄 Actualizando sistema operativo..."
if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
    apt-get update -y && apt-get upgrade -y
elif [ "$OS" = "amzn" ]; then
    dnf update -y
fi
echo "✅ Sistema actualizado"
echo ""

# ─── Instalar Docker ───
echo "🐳 Instalando Docker..."
if ! command -v docker &> /dev/null; then
    if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
        # Instalar dependencias
        apt-get install -y ca-certificates curl gnupg

        # Agregar clave GPG de Docker
        install -m 0755 -d /etc/apt/keyrings
        curl -fsSL https://download.docker.com/linux/$OS/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
        chmod a+r /etc/apt/keyrings/docker.gpg

        # Agregar repositorio
        echo \
            "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/$OS \
            $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
            tee /etc/apt/sources.list.d/docker.list > /dev/null

        apt-get update -y
        apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

    elif [ "$OS" = "amzn" ]; then
        dnf install -y docker
        # Docker Compose plugin para Amazon Linux
        DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep '"tag_name"' | sed -E 's/.*"([^"]+)".*/\1/')
        mkdir -p /usr/local/lib/docker/cli-plugins
        curl -SL "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-linux-$(uname -m)" \
            -o /usr/local/lib/docker/cli-plugins/docker-compose
        chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
    fi
    echo "✅ Docker instalado"
else
    echo "✅ Docker ya está instalado"
fi
echo ""

# ─── Habilitar y arrancar Docker ───
echo "🔄 Habilitando servicio Docker..."
systemctl enable docker
systemctl start docker
echo "✅ Docker habilitado e iniciado"
echo ""

# ─── Agregar usuario al grupo docker ───
# Para no necesitar sudo en cada comando docker
CURRENT_USER=${SUDO_USER:-$USER}
if [ "$CURRENT_USER" != "root" ]; then
    echo "👤 Agregando usuario '$CURRENT_USER' al grupo docker..."
    usermod -aG docker "$CURRENT_USER"
    echo "✅ Usuario agregado (cerrar sesión y volver a entrar para que tome efecto)"
fi
echo ""

# ─── Instalar Git ───
echo "📦 Instalando Git..."
if ! command -v git &> /dev/null; then
    if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
        apt-get install -y git
    elif [ "$OS" = "amzn" ]; then
        dnf install -y git
    fi
    echo "✅ Git instalado"
else
    echo "✅ Git ya está instalado"
fi
echo ""

# ─── Crear directorio de la aplicación ───
APP_DIR=/opt/reservas-api
echo "📁 Creando directorio de la aplicación en $APP_DIR..."
mkdir -p "$APP_DIR"
if [ "$CURRENT_USER" != "root" ]; then
    chown "$CURRENT_USER":"$CURRENT_USER" "$APP_DIR"
fi
echo "✅ Directorio creado"
echo ""

# ─── Resumen ───
echo "============================================"
echo "  ✅ Setup completado"
echo "============================================"
echo ""
echo "Próximos pasos:"
echo "  1. Cerrar sesión y volver a entrar (para permisos Docker)"
echo "  2. Clonar el repositorio:"
echo "     cd $APP_DIR"
echo "     git clone https://github.com/RodriArrue/backend-reservas-api.git ."
echo "  3. Configurar variables de entorno:"
echo "     cp .env.production.example .env.production"
echo "     nano .env.production"
echo "  4. Desplegar:"
echo "     ./deploy/deploy.sh"
echo ""
