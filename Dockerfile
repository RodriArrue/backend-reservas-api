# ========================================
# Stage 1: Base — dependencias
# ========================================
FROM node:18-alpine AS base

WORKDIR /app

# Copiar archivos de dependencias primero (layer cache)
COPY package*.json ./

# ========================================
# Stage 2: Production dependencies
# ========================================
FROM base AS production-deps

RUN npm ci --only=production && npm cache clean --force

# ========================================
# Stage 3: All dependencies (para dev/test)
# ========================================
FROM base AS all-deps

RUN npm ci && npm cache clean --force

# ========================================
# Stage 4: Production
# ========================================
FROM node:18-alpine AS production

LABEL maintainer="Rodrigo Arrue"
LABEL description="Sistema de Reservas API"

WORKDIR /app

# Instalar postgresql-client para pg_isready (usado en el entrypoint)
RUN apk add --no-cache postgresql-client

# Crear usuario no-root para seguridad
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copiar dependencias de producción
COPY --from=production-deps /app/node_modules ./node_modules

# Copiar código fuente
COPY package*.json ./
COPY .sequelizerc ./
COPY src/ ./src/

# Copiar entrypoint
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Crear directorio de logs
RUN mkdir -p logs && chown -R appuser:appgroup /app

# Cambiar a usuario no-root
USER appuser

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]

# ========================================
# Stage 5: Development
# ========================================
FROM node:18-alpine AS development

WORKDIR /app

# Copiar todas las dependencias (incluyendo devDependencies)
COPY --from=all-deps /app/node_modules ./node_modules

# Copiar todo el proyecto
COPY . .

# Crear directorio de logs
RUN mkdir -p logs

ENV NODE_ENV=development
ENV PORT=3000

EXPOSE 3000

CMD ["npx", "nodemon", "src/index.js"]
