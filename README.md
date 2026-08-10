<div align="center">

# 🗓️ Sistema de Reservas API

**API REST robusta y escalable para la gestión de reservas de recursos.**

Diseñada para gestionar salas de reuniones, escritorios, consultorios médicos y cualquier recurso reservable, con seguridad enterprise-grade, arquitectura limpia y despliegue containerizado.

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Sequelize](https://img.shields.io/badge/Sequelize-6.x-52B0E7?style=flat-square&logo=sequelize&logoColor=white)](https://sequelize.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)
[![Jest](https://img.shields.io/badge/Tests-Jest-C21325?style=flat-square&logo=jest&logoColor=white)](https://jestjs.io/)
[![License](https://img.shields.io/badge/License-ISC-blue?style=flat-square)](LICENSE)

[Inicio Rápido](#-inicio-rápido) · [Documentación API](#-endpoints-de-la-api) · [Despliegue](DEPLOYMENT.md)

</div>

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Arquitectura](#-arquitectura)
- [Stack Tecnológico](#-stack-tecnológico)
- [Inicio Rápido](#-inicio-rápido)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [Endpoints de la API](#-endpoints-de-la-api)
- [Seguridad](#-seguridad)
- [Testing](#-testing)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Despliegue](#-despliegue)
- [Autor](#-autor)

---

## ✨ Características

<table>
<tr>
<td width="50%">

### Funcionalidades Principales

- ✅ **Gestión de Usuarios** — CRUD completo con roles `ADMIN` / `USER`
- ✅ **Gestión de Recursos** — Salas, escritorios, consultorios con capacidad y disponibilidad
- ✅ **Sistema de Reservas** — Creación, modificación, cancelación con validación de conflictos
- ✅ **Autenticación JWT** — Access tokens + Refresh tokens con rotación segura
- ✅ **Autorización por Roles** — Permisos diferenciados por tipo de usuario
- ✅ **Documentación Swagger** — Interfaz interactiva en `/api-docs`

</td>
<td width="50%">

### Seguridad Enterprise

- 🔒 **Protección CSRF** — Tokens de validación para operaciones de escritura
- 🔒 **Rate Limiting** — Límites por IP y por endpoint
- 🔒 **Helmet.js** — Headers de seguridad HTTP
- 🔒 **Sanitización XSS** — Limpieza automática de inputs maliciosos
- 🔒 **Bloqueo de Cuentas** — Protección contra fuerza bruta
- 🔒 **Soft Delete** — Eliminación lógica con restauración

</td>
</tr>
</table>

| Característica | Descripción |
|:---|:---|
| 📊 **Auditoría** | Registro automático de acciones críticas del sistema |
| 📄 **Paginación** | Respuestas paginadas para listados extensos |
| 🔍 **Filtros Avanzados** | Búsqueda por múltiples criterios y tipos de recurso |
| 📈 **Estadísticas** | Métricas de uso, ocupación y resumen diario |
| 🐳 **Docker Ready** | Multi-stage Dockerfile + Docker Compose (dev & prod) |
| 🌐 **Nginx Reverse Proxy** | Configuración lista para producción con soporte HTTPS |

---

## 🏗️ Arquitectura

El proyecto implementa una **arquitectura en capas** con separación clara de responsabilidades:

```
                    ┌──────────────────────────────┐
                    │       Client / Swagger        │
                    └──────────────┬───────────────┘
                                   │
                    ┌──────────────▼───────────────┐
                    │    Nginx (Reverse Proxy)      │  ← Producción
                    └──────────────┬───────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────┐
│                        EXPRESS APP                              │
│                                                                │
│  Middlewares → Routes → Controllers → Services → Models        │
│  (Security)   (API)    (HTTP I/O)    (Logic)    (ORM)          │
│                                                                │
│  Helmet · CORS · Rate Limit · CSRF · XSS · HPP                │
└────────────────────────────────┬───────────────────────────────┘
                                 │
                    ┌────────────▼────────────────┐
                    │     PostgreSQL 15 (Docker)   │
                    └─────────────────────────────┘
```

---

## 🛠️ Stack Tecnológico

| Categoría | Tecnología | Propósito |
|:---|:---|:---|
| **Runtime** | Node.js 18+ | Entorno de ejecución JavaScript |
| **Framework** | Express 5.x | Framework web minimalista |
| **Base de Datos** | PostgreSQL 15 | Base de datos relacional |
| **ORM** | Sequelize 6.x | Mapeo objeto-relacional + migraciones |
| **Autenticación** | JWT (jsonwebtoken) | Access + Refresh tokens |
| **Validación** | express-validator · Zod | Validación y tipado de inputs |
| **Seguridad** | Helmet · bcrypt · hpp · xss-clean | Protección multicapa |
| **Documentación** | Swagger (OpenAPI 3.0) | Docs interactivos de la API |
| **Logging** | Winston | Logging estructurado |
| **Testing** | Jest · Supertest | Tests unitarios e integración |
| **Contenedores** | Docker · Docker Compose · Nginx | Orquestación y proxy reverso |
| **Linting** | ESLint · Prettier | Calidad y formato de código |

---

## 🚀 Inicio Rápido

### Requisitos Previos

- **Node.js** ≥ 18.0.0
- **Docker** y **Docker Compose**
- **Git**

### Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/RodriArrue/backend-reservas-api.git
cd backend-reservas-api

# 2. Instalar dependencias
npm install

# 3. Iniciar PostgreSQL en Docker
docker compose up -d postgres

# 4. Configurar variables de entorno
cp .env.example .env

# 5. Ejecutar migraciones y cargar datos de ejemplo
npm run db:reset

# 6. Iniciar en modo desarrollo (con hot-reload)
npm run dev
```

El servidor estará disponible en **`http://localhost:3000`**

> [!TIP]
> La documentación interactiva Swagger está en **`http://localhost:3000/api-docs`**

### Credenciales de Prueba

| Rol | Email | Contraseña |
|:---|:---|:---|
| **Admin** | `admin@reservas.com` | `Admin123!` |
| **User** | `maria.garcia@ejemplo.com` | `User123!` |

---

## ⚙️ Configuración

### Variables de Entorno

Crea un archivo `.env` basado en `.env.example`:

```env
# ── Base de Datos ─────────────────────────
DB_NAME=reservas_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5433

# ── Aplicación ────────────────────────────
NODE_ENV=development
PORT=3000

# ── JWT (⚠️ Cambiar en producción) ───────
JWT_SECRET=tu_secreto_super_seguro_aqui
JWT_EXPIRATION=24h
REFRESH_TOKEN_SECRET=otro_secreto_para_refresh_tokens
```

### Scripts Disponibles

| Comando | Descripción |
|:---|:---|
| `npm start` | Servidor en modo producción |
| `npm run dev` | Servidor con hot-reload (nodemon) |
| `npm test` | Ejecutar todos los tests |
| `npm run test:coverage` | Tests con reporte de cobertura |
| `npm run test:unit` | Solo tests unitarios |
| `npm run test:integration` | Solo tests de integración |
| `npm run migrate` | Ejecutar migraciones pendientes |
| `npm run migrate:undo` | Revertir la última migración |
| `npm run migrate:status` | Estado de las migraciones |
| `npm run seed` | Cargar datos de ejemplo |
| `npm run db:reset` | Resetear DB completa |
| `npm run lint` | Analizar código con ESLint |
| `npm run format` | Formatear código con Prettier |

---

## 📖 Uso

### Health Check

```bash
curl http://localhost:3000/health
# → { "status": "OK", "timestamp": "2026-01-08T18:00:00.000Z" }
```

### Flujo Básico

<details>
<summary><strong>1 · Registrar un usuario</strong></summary>

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Pérez",
    "email": "juan@ejemplo.com",
    "password": "MiPassword123"
  }'
```
</details>

<details>
<summary><strong>2 · Iniciar sesión</strong></summary>

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@ejemplo.com",
    "password": "MiPassword123"
  }'
```

Respuesta:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "abc123...",
    "user": {
      "id": "uuid-del-usuario",
      "nombre": "Juan Pérez",
      "email": "juan@ejemplo.com",
      "rol": "USER"
    }
  }
}
```
</details>

<details>
<summary><strong>3 · Crear una reserva</strong></summary>

```bash
curl -X POST http://localhost:3000/api/reservations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_ACCESS_TOKEN" \
  -H "X-CSRF-Token: test-csrf-token" \
  -d '{
    "user_id": "uuid-del-usuario",
    "resource_id": "uuid-del-recurso",
    "start_time": "2026-01-10T09:00:00Z",
    "end_time": "2026-01-10T10:00:00Z"
  }'
```
</details>

---

## 🔌 Endpoints de la API

> 📘 Documentación interactiva completa en **`/api-docs`** (Swagger UI)

### Autenticación — `/api/auth`

| Método | Endpoint | Descripción | Auth |
|:---:|:---|:---|:---:|
| `POST` | `/register` | Registrar nuevo usuario | — |
| `POST` | `/login` | Iniciar sesión | — |
| `POST` | `/refresh` | Renovar access token | — |
| `POST` | `/logout` | Cerrar sesión actual | — |
| `POST` | `/logout-all` | Cerrar todas las sesiones | ✅ |
| `GET` | `/me` | Obtener perfil actual | ✅ |

### Usuarios — `/api/users`

| Método | Endpoint | Descripción | Auth |
|:---:|:---|:---|:---:|
| `GET` | `/` | Listar usuarios (paginado) | ✅ |
| `GET` | `/:id` | Obtener usuario por ID | ✅ |
| `POST` | `/` | Crear usuario | 🔑 |
| `PUT` | `/:id` | Actualizar usuario | 🔑 |
| `DELETE` | `/:id` | Eliminar usuario (soft delete) | 🔑 |
| `POST` | `/:id/restore` | Restaurar usuario | 🔑 |
| `PATCH` | `/:id/toggle-active` | Activar / desactivar | 🔑 |
| `PATCH` | `/:id/change-role` | Cambiar rol | 🔑 |

### Recursos — `/api/resources`

| Método | Endpoint | Descripción | Auth |
|:---:|:---|:---|:---:|
| `GET` | `/` | Listar recursos (paginado) | — |
| `GET` | `/available` | Recursos disponibles | — |
| `GET` | `/type/:tipo` | Filtrar por tipo | — |
| `GET` | `/:id` | Obtener recurso por ID | — |
| `GET` | `/:id/reservations` | Recurso con sus reservas | — |
| `POST` | `/` | Crear recurso | 🔑 |
| `PUT` | `/:id` | Actualizar recurso | 🔑 |
| `DELETE` | `/:id` | Eliminar recurso (soft delete) | 🔑 |
| `POST` | `/:id/restore` | Restaurar recurso | 🔑 |
| `PATCH` | `/:id/toggle-active` | Activar / desactivar | 🔑 |

### Reservas — `/api/reservations`

| Método | Endpoint | Descripción | Auth |
|:---:|:---|:---|:---:|
| `GET` | `/` | Listar reservas (paginado) | — |
| `GET` | `/today` | Reservas del día actual | — |
| `GET` | `/stats` | Estadísticas de uso | — |
| `GET` | `/user/:userId` | Reservas de un usuario | — |
| `GET` | `/resource/:resourceId` | Reservas de un recurso | — |
| `GET` | `/:id` | Obtener reserva por ID | — |
| `POST` | `/` | Crear reserva | ✅ CSRF |
| `PUT` | `/:id` | Actualizar reserva | ✅ CSRF |
| `DELETE` | `/:id` | Eliminar reserva | ✅ CSRF |
| `POST` | `/:id/cancel` | Cancelar reserva | ✅ CSRF |
| `POST` | `/:id/confirm` | Confirmar reserva | ✅ CSRF |
| `POST` | `/:id/restore` | Restaurar reserva | ✅ CSRF |

> **Leyenda:** — Público · ✅ Token requerido · 🔑 Admin + CSRF

---

## 🔐 Seguridad

### Autenticación JWT (Doble Token)

| Token | Duración | Propósito |
|:---|:---:|:---|
| **Access Token** | 15 min | Autenticar cada petición |
| **Refresh Token** | 7 días | Renovar el access token |

```
Authorization: Bearer <access_token>
```

### Protección CSRF

Las operaciones de escritura (`POST`, `PUT`, `DELETE`) requieren el header:

```
X-CSRF-Token: <token>
```

> [!NOTE]
> En desarrollo, se puede usar `test-csrf-token` para testing.

### Rate Limiting

| Tipo | Límite | Ventana |
|:---|:---:|:---:|
| Global | 100 req | 15 min |
| Login / Register | 5 req | 15 min |
| Creación de recursos | 10 req | 15 min |

### Bloqueo de Cuentas

- **5 intentos fallidos** → cuenta bloqueada por **15 minutos**
- Se resetea automáticamente tras un login exitoso

---

## 🧪 Testing

```bash
npm test                    # Todos los tests
npm run test:coverage       # Con reporte de cobertura
npm run test:unit           # Solo unitarios
npm run test:integration    # Solo integración
npm run test:watch          # Modo watch (desarrollo)
```

### Estructura de Tests

```
tests/
├── helpers/                # Utilidades y mocks compartidos
├── integration/            # Tests de API end-to-end
│   ├── auth.test.js
│   ├── reservations.test.js
│   ├── resources.test.js
│   └── users.test.js
├── unit/                   # Tests de lógica de negocio
│   ├── middlewares/
│   └── services/
└── setup.js                # Configuración global de Jest
```

---

## 📁 Estructura del Proyecto

```
backend-reservas-api/
├── src/
│   ├── config/                 # Configuración (DB, Swagger)
│   ├── controllers/            # Controladores HTTP
│   ├── database/
│   │   ├── migrations/         # Migraciones Sequelize
│   │   └── seeders/            # Datos de ejemplo
│   ├── middlewares/            # Middlewares Express
│   │   ├── authMiddleware.js
│   │   ├── csrfMiddleware.js
│   │   ├── rateLimitMiddleware.js
│   │   ├── roleMiddleware.js
│   │   └── sanitizerMiddleware.js
│   ├── models/                 # Modelos Sequelize (ORM)
│   ├── routes/                 # Definición de rutas
│   ├── services/               # Lógica de negocio
│   ├── validators/             # Reglas de validación
│   ├── utils/                  # Utilidades y errores custom
│   ├── app.js                  # Configuración de Express
│   └── index.js                # Entry point
├── tests/                      # Suite de testing
├── deploy/                     # Scripts de despliegue
├── nginx/                      # Configuración Nginx
├── Dockerfile                  # Multi-stage build
├── docker-compose.yml          # Orquestación desarrollo
├── docker-compose.production.yml  # Orquestación producción
├── DEPLOYMENT.md               # Guía de despliegue AWS
└── package.json
```

---

## 🚢 Despliegue

El proyecto incluye configuración completa para despliegue en **AWS EC2** con Docker:

- **Multi-stage Dockerfile** — Builds optimizados para producción
- **Docker Compose** — Orquestación de PostgreSQL + API + Nginx
- **Scripts automatizados** — Setup y deploy con un solo comando
- **Nginx reverse proxy** — Con configuración preparada para HTTPS

📖 Ver la **[Guía de Despliegue completa →](DEPLOYMENT.md)**

---

## 👨‍💻 Autor

**Rodrigo Arrue** — [@RodriArrue](https://github.com/RodriArrue)

---

<div align="center">

⭐ Si este proyecto te resulta útil, ¡deja una estrella en el repositorio!

</div>