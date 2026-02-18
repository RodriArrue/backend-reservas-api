<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express">
  <img src="https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Sequelize-6.x-52B0E7?style=for-the-badge&logo=sequelize&logoColor=white" alt="Sequelize">
  <img src="https://img.shields.io/badge/Jest-Testing-C21325?style=for-the-badge&logo=jest&logoColor=white" alt="Jest">
</p>

# 🗓️ Sistema de Reservas API

API REST robusta y escalable para la gestión de reservas de recursos (salas de reuniones, escritorios, consultorios médicos, etc.). Diseñada con buenas prácticas de desarrollo, seguridad enterprise-grade y arquitectura limpia.

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Arquitectura](#-arquitectura)
- [Tecnologías](#-tecnologías)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [Endpoints de la API](#-endpoints-de-la-api)
- [Seguridad](#-seguridad)
- [Testing](#-testing)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Autor](#-autor)

---

## ✨ Características

### Funcionalidades Principales
- ✅ **Gestión de Usuarios** - CRUD completo con roles (ADMIN/USER)
- ✅ **Gestión de Recursos** - Salas, escritorios, consultorios con capacidad y disponibilidad
- ✅ **Sistema de Reservas** - Creación, modificación, cancelación con validación de conflictos
- ✅ **Autenticación JWT** - Access tokens + Refresh tokens con rotación segura
- ✅ **Autorización por Roles** - Permisos diferenciados para administradores y usuarios

### Seguridad Enterprise
- 🔒 **Protección CSRF** - Tokens de validación para operaciones críticas
- 🔒 **Rate Limiting** - Límites de peticiones por IP y endpoint
- 🔒 **Helmet.js** - Headers de seguridad HTTP
- 🔒 **Sanitización XSS** - Limpieza de inputs maliciosos
- 🔒 **Bloqueo de Cuentas** - Protección contra ataques de fuerza bruta
- 🔒 **Soft Delete** - Eliminación lógica con posibilidad de restauración

### Características Técnicas
- 📊 **Auditoría** - Registro de acciones críticas del sistema
- 📄 **Paginación** - Respuestas paginadas para listados grandes
- 🔍 **Filtros Avanzados** - Búsqueda por múltiples criterios
- 📈 **Estadísticas** - Métricas de uso y ocupación
- 🐳 **Docker Ready** - Configuración lista para contenedores

---

## 🏗️ Arquitectura

El proyecto sigue una **arquitectura en capas** siguiendo principios de Clean Architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                        ROUTES                                │
│    Define endpoints y aplica middlewares de validación       │
├─────────────────────────────────────────────────────────────┤
│                      CONTROLLERS                             │
│     Maneja requests/responses HTTP, delega a servicios       │
├─────────────────────────────────────────────────────────────┤
│                       SERVICES                               │
│        Lógica de negocio, validaciones, transacciones        │
├─────────────────────────────────────────────────────────────┤
│                        MODELS                                │
│         Definición de entidades y relaciones (ORM)           │
├─────────────────────────────────────────────────────────────┤
│                       DATABASE                               │
│                     PostgreSQL                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tecnologías

| Categoría | Tecnología | Propósito |
|-----------|------------|-----------|
| **Runtime** | Node.js 18+ | Entorno de ejecución JavaScript |
| **Framework** | Express 5.x | Framework web minimalista |
| **Base de Datos** | PostgreSQL 15 | Base de datos relacional |
| **ORM** | Sequelize 6.x | Mapeo objeto-relacional |
| **Autenticación** | JWT | Tokens de acceso seguros |
| **Seguridad** | Helmet, bcrypt, hpp | Protección de la aplicación |
| **Validación** | express-validator | Validación de inputs |
| **Testing** | Jest + Supertest | Tests unitarios e integración |
| **Contenedores** | Docker Compose | Orquestación de servicios |

---

## 📦 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Docker** y **Docker Compose** (para la base de datos)
- **Git**

---

## 🚀 Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/RodriArrue/backend-reservas-api.git
cd backend-reservas-api
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Iniciar la Base de Datos

```bash
# Levanta PostgreSQL en Docker
docker-compose up -d

# Verifica que esté corriendo
docker ps
```

### 4. Configurar Variables de Entorno

```bash
# Copia el archivo de ejemplo
cp .env.example .env

# Edita con tus valores (opcional, los defaults funcionan con Docker)
nano .env
```

### 5. Ejecutar Migraciones

```bash
# Crear todas las tablas con migraciones
npm run migrate

# Ver estado de las migraciones
npm run migrate:status
```

### 6. Cargar Datos de Ejemplo

```bash
# Insertar datos de prueba (usuarios, recursos, reservas)
npm run seed
```

> **Credenciales de prueba creadas:**
> | Rol | Email | Contraseña |
> |-----|-------|------------|
> | ADMIN | `admin@reservas.com` | `Admin123!` |
> | USER | `maria.garcia@ejemplo.com` | `User123!` |

> [!TIP]
> Para resetear todo de una vez (migraciones + seeds): `npm run db:reset`

### 7. Iniciar el Servidor

```bash
# Modo desarrollo (con hot-reload)
npm run dev

# Modo producción
npm start
```

El servidor estará disponible en: `http://localhost:3000`

---

## ⚙️ Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Base de Datos
DB_NAME=reservas_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5433

# Aplicación
NODE_ENV=development
PORT=3000

# JWT (⚠️ Cambia en producción)
JWT_SECRET=tu_secreto_super_seguro_aqui
JWT_EXPIRATION=24h
REFRESH_TOKEN_SECRET=otro_secreto_para_refresh_tokens
```

### Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm start` | Inicia el servidor en producción |
| `npm run dev` | Inicia con nodemon (hot-reload) |
| `npm run migrate` | Ejecuta migraciones pendientes |
| `npm run migrate:undo` | Revierte la última migración |
| `npm run migrate:undo:all` | Revierte todas las migraciones |
| `npm run migrate:status` | Estado de las migraciones |
| `npm run seed` | Carga datos de ejemplo |
| `npm run seed:undo` | Elimina datos de ejemplo |
| `npm run db:reset` | Resetea DB completa (migrate + seed) |
| `npm test` | Ejecuta todos los tests |
| `npm run test:unit` | Solo tests unitarios |
| `npm run test:integration` | Solo tests de integración |
| `npm run test:coverage` | Tests con reporte de cobertura |

---

## 📖 Uso

### Health Check

Verifica que el servidor esté funcionando:

```bash
curl http://localhost:3000/health
```

Respuesta:
```json
{
  "status": "OK",
  "timestamp": "2026-01-08T18:00:00.000Z"
}
```

### Flujo Básico de Uso

#### 1. Registrar un Usuario

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Pérez",
    "email": "juan@ejemplo.com",
    "password": "MiPassword123"
  }'
```

#### 2. Iniciar Sesión

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@ejemplo.com",
    "password": "MiPassword123"
  }'
```

Respuesta (guarda el token):
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

#### 3. Crear una Reserva

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

---

## 🔌 Endpoints de la API

### Autenticación (`/api/auth`)

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| `POST` | `/register` | Registrar nuevo usuario | ❌ Público |
| `POST` | `/login` | Iniciar sesión | ❌ Público |
| `POST` | `/refresh` | Renovar access token | ❌ Público |
| `POST` | `/logout` | Cerrar sesión actual | ❌ Público |
| `POST` | `/logout-all` | Cerrar todas las sesiones | ✅ Requerido |
| `GET` | `/me` | Obtener perfil actual | ✅ Requerido |

### Usuarios (`/api/users`)

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| `GET` | `/` | Listar usuarios | ✅ Requerido |
| `GET` | `/:id` | Obtener usuario por ID | ✅ Requerido |
| `POST` | `/` | Crear usuario | ✅ ADMIN + CSRF |
| `PUT` | `/:id` | Actualizar usuario | ✅ ADMIN + CSRF |
| `DELETE` | `/:id` | Eliminar usuario (soft) | ✅ ADMIN + CSRF |
| `POST` | `/:id/restore` | Restaurar usuario | ✅ ADMIN + CSRF |
| `POST` | `/login` | Login (deprecado) | ❌ Público |
| `PATCH` | `/:id/toggle-active` | Activar/Desactivar | ✅ ADMIN + CSRF |
| `PATCH` | `/:id/change-role` | Cambiar rol | ✅ ADMIN + CSRF |

### Recursos (`/api/resources`)

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| `GET` | `/` | Listar recursos | ❌ Público |
| `GET` | `/available` | Recursos disponibles | ❌ Público |
| `GET` | `/type/:tipo` | Filtrar por tipo | ❌ Público |
| `GET` | `/:id` | Obtener recurso por ID | ❌ Público |
| `GET` | `/:id/reservations` | Recurso con reservas | ❌ Público |
| `POST` | `/` | Crear recurso | ✅ ADMIN + CSRF |
| `PUT` | `/:id` | Actualizar recurso | ✅ ADMIN + CSRF |
| `DELETE` | `/:id` | Eliminar recurso | ✅ ADMIN + CSRF |
| `POST` | `/:id/restore` | Restaurar recurso | ✅ ADMIN + CSRF |
| `PATCH` | `/:id/toggle-active` | Activar/Desactivar | ✅ ADMIN + CSRF |

### Reservas (`/api/reservations`)

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| `GET` | `/` | Listar reservas | ❌ Público |
| `GET` | `/today` | Reservas de hoy | ❌ Público |
| `GET` | `/stats` | Estadísticas | ❌ Público |
| `GET` | `/user/:userId` | Reservas de usuario | ❌ Público |
| `GET` | `/resource/:resourceId` | Reservas de recurso | ❌ Público |
| `GET` | `/:id` | Obtener por ID | ❌ Público |
| `POST` | `/` | Crear reserva | ✅ Auth + CSRF |
| `PUT` | `/:id` | Actualizar reserva | ✅ Auth + CSRF |
| `DELETE` | `/:id` | Eliminar reserva | ✅ Auth + CSRF |
| `POST` | `/:id/cancel` | Cancelar reserva | ✅ Auth + CSRF |
| `POST` | `/:id/confirm` | Confirmar reserva | ✅ Auth + CSRF |
| `POST` | `/:id/restore` | Restaurar reserva | ✅ Auth + CSRF |

---

## 🔐 Seguridad

### Autenticación JWT

El sistema utiliza un esquema de **doble token**:

1. **Access Token** (15 min): Para autenticar peticiones
2. **Refresh Token** (7 días): Para renovar el access token

```
Authorization: Bearer <access_token>
```

### Protección CSRF

Las operaciones de escritura (POST, PUT, DELETE) requieren el header:

```
X-CSRF-Token: <token>
```

> **Nota para testing**: En desarrollo, puedes usar `test-csrf-token`

### Rate Limiting

| Tipo | Límite | Ventana |
|------|--------|---------|
| Global | 100 req | 15 min |
| Login/Register | 5 req | 15 min |
| Creación | 10 req | 15 min |

### Bloqueo de Cuentas

- Después de **5 intentos fallidos** de login
- La cuenta se bloquea por **15 minutos**
- Se resetea automáticamente tras login exitoso

---

## 🧪 Testing

### Ejecutar Tests

```bash
# Todos los tests
npm test

# Con coverage
npm run test:coverage

# Solo unitarios
npm run test:unit

# Solo integración
npm run test:integration

# Modo watch (desarrollo)
npm run test:watch
```

### Estructura de Tests

```
tests/
├── helpers/           # Utilidades para tests
├── integration/       # Tests de API completos
│   └── *.test.js
├── unit/              # Tests de servicios/lógica
│   └── *.test.js
└── setup.js           # Configuración global
```

---

## 📁 Estructura del Proyecto

```
src/
├── config/            # Configuración de base de datos
│   └── database.js
├── controllers/       # Controladores HTTP
│   ├── AuthController.js
│   ├── ReservationController.js
│   ├── ResourceController.js
│   └── UserController.js
├── database/          # Migraciones y datos de ejemplo
│   ├── migrations/    # Migraciones Sequelize CLI
│   │   ├── 01-create-users.js
│   │   ├── 02-create-resources.js
│   │   ├── 03-create-reservations.js
│   │   ├── 04-create-audit-logs.js
│   │   ├── 05-create-refresh-tokens.js
│   │   └── 06-create-token-blacklist.js
│   └── seeders/       # Datos de ejemplo
│       ├── 01-demo-users.js
│       ├── 02-demo-resources.js
│       └── 03-demo-reservations.js
├── middlewares/       # Middlewares Express
│   ├── authMiddleware.js
│   ├── csrfMiddleware.js
│   ├── rateLimitMiddleware.js
│   ├── roleMiddleware.js
│   └── sanitizerMiddleware.js
├── models/            # Modelos Sequelize
│   ├── AuditLog.js
│   ├── RefreshToken.js
│   ├── Reservation.js
│   ├── Resource.js
│   ├── TokenBlacklist.js
│   └── User.js
├── routes/            # Definición de rutas
│   ├── authRoutes.js
│   ├── reservationRoutes.js
│   ├── resourceRoutes.js
│   └── userRoutes.js
├── services/          # Lógica de negocio
│   ├── AuditService.js
│   ├── AuthService.js
│   ├── ReservationService.js
│   ├── ResourceService.js
│   └── UserService.js
├── validators/        # Reglas de validación
│   └── *.js
├── app.js             # Configuración Express
└── index.js           # Entry point
```

---

## 👨‍💻 Autor

**Rodrigo Arrue**

- GitHub: [@RodriArrue](https://github.com/RodriArrue)

---