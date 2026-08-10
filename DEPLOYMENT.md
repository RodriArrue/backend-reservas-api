<div align="center">

# 🚀 Guía de Despliegue — AWS EC2

Instrucciones paso a paso para desplegar la API en una instancia EC2 de AWS usando Docker, Nginx y PostgreSQL.

</div>

---

## 📋 Índice

- [Requisitos Previos](#-requisitos-previos)
- [Crear la Instancia EC2](#1--crear-la-instancia-ec2)
- [Configurar Security Group](#2--configurar-security-group)
- [Conectarse por SSH](#3--conectarse-por-ssh)
- [Setup Inicial del Servidor](#4--setup-inicial-del-servidor)
- [Clonar y Configurar el Proyecto](#5--clonar-y-configurar-el-proyecto)
- [Desplegar](#6--desplegar)
- [Verificar el Despliegue](#7--verificar-el-despliegue)
- [Mantenimiento](#-mantenimiento)
- [Agregar HTTPS](#-agregar-https-opcional)

---

## 📦 Requisitos Previos

| Requisito | Detalle |
|:---|:---|
| **Cuenta de AWS** | Free Tier disponible por 12 meses |
| **Key Pair SSH** | Par de claves `.pem` creado en AWS |
| **Git** | Repositorio actualizado en GitHub |

---

## 1 · Crear la Instancia EC2

1. Ir a **AWS Console** → **EC2** → **Launch Instance**
2. Configurar:

   | Parámetro | Valor |
   |:---|:---|
   | **Nombre** | `reservas-api` |
   | **AMI** | Ubuntu Server 24.04 LTS |
   | **Tipo de instancia** | `t3.micro` (Free Tier) |
   | **Key pair** | Seleccionar o crear uno nuevo |
   | **Storage** | 20 GB gp3 |

3. En **Network settings** → configurar Security Group (ver paso 2)
4. Click en **Launch Instance**

---

## 2 · Configurar Security Group

Crear o editar el Security Group con estas reglas de entrada:

| Tipo | Protocolo | Puerto | Origen | Descripción |
|:---|:---:|:---:|:---|:---|
| SSH | TCP | `22` | Tu IP (`Mi IP`) | Acceso SSH |
| HTTP | TCP | `80` | `0.0.0.0/0` | API pública |
| HTTPS | TCP | `443` | `0.0.0.0/0` | API con SSL (futuro) |

> [!WARNING]
> **Nunca expongas el puerto 22 a `0.0.0.0/0`.** Restringe el acceso SSH exclusivamente a tu IP.

---

## 3 · Conectarse por SSH

```bash
# Dar permisos al key pair
chmod 400 tu-key-pair.pem

# Conectar (reemplazar con tu IP pública de EC2)
ssh -i tu-key-pair.pem ubuntu@TU_IP_PUBLICA_EC2

# Si usás Amazon Linux:
ssh -i tu-key-pair.pem ec2-user@TU_IP_PUBLICA_EC2
```

---

## 4 · Setup Inicial del Servidor

El script de setup instala Docker, Docker Compose, y configura el servidor automáticamente:

```bash
# Descargar y ejecutar el script de setup
curl -O https://raw.githubusercontent.com/RodriArrue/backend-reservas-api/main/deploy/setup-ec2.sh
chmod +x setup-ec2.sh
sudo ./setup-ec2.sh
```

> [!IMPORTANT]
> Después del setup, **cerrá y volvé a abrir la sesión SSH** para que los permisos de Docker tomen efecto:
> ```bash
> exit
> ssh -i tu-key-pair.pem ubuntu@TU_IP_PUBLICA_EC2
> ```

---

## 5 · Clonar y Configurar el Proyecto

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

### Generar Secretos JWT

```bash
# Generar JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generar REFRESH_TOKEN_SECRET (ejecutar de nuevo)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

> [!CAUTION]
> Copiá los valores generados en `.env.production`. **Nunca uses los valores por defecto en producción.**

---

## 6 · Desplegar

```bash
./deploy/deploy.sh
```

El script automáticamente:

1. ✅ Construye las imágenes Docker (multi-stage)
2. ✅ Inicia PostgreSQL, la API y Nginx
3. ✅ Ejecuta las migraciones de base de datos
4. ✅ Verifica que todos los servicios estén saludables

---

## 7 · Verificar el Despliegue

```bash
# Health check
curl http://TU_IP_PUBLICA_EC2/health

# Endpoint principal
curl http://TU_IP_PUBLICA_EC2/

# Documentación Swagger (abrir en navegador)
# → http://TU_IP_PUBLICA_EC2/api-docs
```

---

## 🔧 Mantenimiento

### Ver Logs

```bash
# Todos los servicios
docker compose -f docker-compose.production.yml logs -f

# Solo la API
docker compose -f docker-compose.production.yml logs -f api

# Solo PostgreSQL
docker compose -f docker-compose.production.yml logs -f postgres
```

### Reiniciar Servicios

```bash
docker compose -f docker-compose.production.yml restart
```

### Actualizar la Aplicación

```bash
cd /opt/reservas-api
git pull origin main
./deploy/deploy.sh
```

### Detener Servicios

```bash
# Detener (conservando datos)
docker compose -f docker-compose.production.yml down

# Detener y eliminar datos (⚠️ borra la base de datos)
docker compose -f docker-compose.production.yml down -v
```

### Cargar Datos de Ejemplo

```bash
docker compose -f docker-compose.production.yml exec api \
  npx sequelize-cli db:seed:all --env production
```

---

## 🔒 Agregar HTTPS (Opcional)

Para habilitar HTTPS necesitás un dominio apuntando a tu IP de EC2.

### 1 · Obtener un Dominio

- Comprar uno económico (~$3/año en Namecheap, Porkbun, etc.)
- O usar un subdominio gratuito (DuckDNS)
- Crear un registro **A** apuntando a tu IP pública de EC2

### 2 · Instalar Certbot y Generar Certificado

```bash
sudo apt install certbot -y

# Detener Nginx temporalmente
docker compose -f docker-compose.production.yml stop nginx

# Generar certificado SSL
sudo certbot certonly --standalone -d tu-dominio.com

# Reiniciar Nginx
docker compose -f docker-compose.production.yml start nginx
```

### 3 · Actualizar Configuración

1. Editar `nginx/nginx.conf` — descomentar el bloque HTTPS
2. Editar `docker-compose.production.yml` — descomentar puerto 443 y volumen de certificados
3. Reiniciar Nginx:

```bash
docker compose -f docker-compose.production.yml restart nginx
```

### 4 · Renovación Automática

```bash
# Agregar cron job para renovar cada 60 días
(crontab -l 2>/dev/null; echo "0 3 1 */2 * certbot renew --quiet") | crontab -
```

---

<div align="center">

← Volver al [README principal](README.md)

</div>
