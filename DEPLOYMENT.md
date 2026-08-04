# 🚀 Guía de Despliegue en AWS EC2

Guía paso a paso para desplegar el Sistema de Reservas API en una instancia EC2 de AWS.

## Índice

- [Requisitos previos](#requisitos-previos)
- [1. Crear la instancia EC2](#1-crear-la-instancia-ec2)
- [2. Configurar Security Group](#2-configurar-security-group)
- [3. Conectarse por SSH](#3-conectarse-por-ssh)
- [4. Setup inicial del servidor](#4-setup-inicial-del-servidor)
- [5. Clonar y configurar el proyecto](#5-clonar-y-configurar-el-proyecto)
- [6. Desplegar](#6-desplegar)
- [7. Verificar](#7-verificar)
- [Mantenimiento](#mantenimiento)
- [Agregar HTTPS (opcional)](#agregar-https-opcional)

---

## Requisitos previos

- Cuenta de AWS (tiene Free Tier por 12 meses)
- Par de claves SSH (key pair) creado en AWS
- Git con el repositorio actualizado

---

## 1. Crear la instancia EC2

1. Ir a **AWS Console** → **EC2** → **Launch Instance**
2. Configurar:
   - **Nombre**: `reservas-api`
   - **AMI**: Ubuntu Server 24.04 LTS (o Amazon Linux 2023)
   - **Tipo de instancia**: `t3.micro` (Free Tier elegible)
   - **Key pair**: Seleccionar o crear uno nuevo (descargar el `.pem`)
   - **Storage**: 20 GB gp3 (suficiente)
3. En **Network settings** → configurar Security Group (ver paso 2)
4. Click en **Launch Instance**

---

## 2. Configurar Security Group

Crear o editar el Security Group con estas reglas de entrada (Inbound Rules):

| Tipo | Protocolo | Puerto | Origen | Descripción |
|------|-----------|--------|--------|-------------|
| SSH | TCP | 22 | Tu IP (`Mi IP`) | Acceso SSH |
| HTTP | TCP | 80 | `0.0.0.0/0` | API pública |
| HTTPS | TCP | 443 | `0.0.0.0/0` | API pública (futuro) |

> ⚠️ **No expongas** el puerto 22 a `0.0.0.0/0`. Restringilo a tu IP.

---

## 3. Conectarse por SSH

```bash
# Dar permisos al key pair
chmod 400 tu-key-pair.pem

# Conectar (reemplazar con tu IP pública de EC2)
ssh -i tu-key-pair.pem ubuntu@TU_IP_PUBLICA_EC2

# Si usás Amazon Linux:
ssh -i tu-key-pair.pem ec2-user@TU_IP_PUBLICA_EC2
```

---

## 4. Setup inicial del servidor

```bash
# Descargar el script de setup
curl -O https://raw.githubusercontent.com/RodriArrue/backend-reservas-api/main/deploy/setup-ec2.sh
chmod +x setup-ec2.sh
sudo ./setup-ec2.sh

# Cerrar sesión y volver a entrar (para que los permisos de Docker tomen efecto)
exit
ssh -i tu-key-pair.pem ubuntu@TU_IP_PUBLICA_EC2
```

---

## 5. Clonar y configurar el proyecto

```bash
# Ir al directorio de la aplicación
cd /opt/reservas-api

# Clonar el repositorio
git clone https://github.com/RodriArrue/backend-reservas-api.git .

# Crear archivo de variables de entorno
cp .env.production.example .env.production

# Editar con valores reales
nano .env.production
```

### Generar secretos seguros para JWT

```bash
# Generar JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generar REFRESH_TOKEN_SECRET (ejecutar de nuevo)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

> Copiar los valores generados en `.env.production`

---

## 6. Desplegar

```bash
# Ejecutar el script de deploy
./deploy/deploy.sh
```

El script automáticamente:
1. Construye las imágenes Docker
2. Inicia PostgreSQL, la API y Nginx
3. Ejecuta las migraciones de base de datos
4. Verifica que todo esté funcionando

---

## 7. Verificar

```bash
# Health check
curl http://TU_IP_PUBLICA_EC2/health

# Ver endpoint principal
curl http://TU_IP_PUBLICA_EC2/

# Ver documentación Swagger
# Abrir en navegador: http://TU_IP_PUBLICA_EC2/api-docs
```

---

## Mantenimiento

### Ver logs
```bash
# Todos los servicios
docker compose -f docker-compose.production.yml logs -f

# Solo la API
docker compose -f docker-compose.production.yml logs -f api

# Solo PostgreSQL
docker compose -f docker-compose.production.yml logs -f postgres
```

### Reiniciar servicios
```bash
docker compose -f docker-compose.production.yml restart
```

### Actualizar la aplicación
```bash
cd /opt/reservas-api
git pull origin main
./deploy/deploy.sh
```

### Detener todo
```bash
docker compose -f docker-compose.production.yml down
```

### Detener y eliminar datos (⚠️ borra la base de datos)
```bash
docker compose -f docker-compose.production.yml down -v
```

### Cargar datos de ejemplo (seeds)
```bash
docker compose -f docker-compose.production.yml exec api npx sequelize-cli db:seed:all --env production
```

---

## Agregar HTTPS (opcional)

Para habilitar HTTPS necesitás un dominio apuntando a tu IP de EC2.

### 1. Obtener dominio
- Comprar uno barato (~$3/año en Namecheap, Porkbun, etc.)
- O usar un subdominio gratuito (DuckDNS, Freenom)
- Crear un registro **A** apuntando a tu IP pública de EC2

### 2. Instalar Certbot y generar certificado
```bash
sudo apt install certbot -y

# Detener Nginx temporalmente
docker compose -f docker-compose.production.yml stop nginx

# Generar certificado
sudo certbot certonly --standalone -d tu-dominio.com

# Reiniciar Nginx
docker compose -f docker-compose.production.yml start nginx
```

### 3. Actualizar configuración
1. Editar `nginx/nginx.conf` — descomentar el bloque HTTPS
2. Editar `docker-compose.production.yml` — descomentar puerto 443 y volumen de certificados
3. Reiniciar: `docker compose -f docker-compose.production.yml restart nginx`

### 4. Renovación automática del certificado
```bash
# Agregar cron job para renovar cada 60 días
(crontab -l 2>/dev/null; echo "0 3 1 */2 * certbot renew --quiet") | crontab -
```
