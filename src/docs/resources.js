/**
 * @swagger
 * /resources:
 *   get:
 *     tags: [Resources]
 *     summary: Listar recursos
 *     description: Obtiene todos los recursos con paginación y filtros
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [SALA, ESCRITORIO, CONSULTORIO]
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: capacidadMin
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista paginada de recursos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *
 *   post:
 *     tags: [Resources]
 *     summary: Crear recurso
 *     description: Crea un nuevo recurso (solo ADMIN)
 *     security:
 *       - bearerAuth: []
 *       - csrfToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, tipo]
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Sala de Reuniones B
 *               tipo:
 *                 type: string
 *                 enum: [SALA, ESCRITORIO, CONSULTORIO]
 *               capacidad:
 *                 type: integer
 *                 example: 8
 *               descripcion:
 *                 type: string
 *                 example: Sala con pizarra y videoconferencia
 *     responses:
 *       201:
 *         description: Recurso creado
 *       400:
 *         description: Datos inválidos
 *       403:
 *         description: Sin permisos o CSRF inválido
 *
 * /resources/available:
 *   get:
 *     tags: [Resources]
 *     summary: Recursos disponibles
 *     description: Obtiene recursos disponibles en un rango de tiempo
 *     parameters:
 *       - in: query
 *         name: startTime
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         example: '2026-03-01T09:00:00Z'
 *       - in: query
 *         name: endTime
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         example: '2026-03-01T10:00:00Z'
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [SALA, ESCRITORIO, CONSULTORIO]
 *       - in: query
 *         name: capacidadMin
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de recursos disponibles
 *       400:
 *         description: startTime y endTime requeridos
 *
 * /resources/type/{tipo}:
 *   get:
 *     tags: [Resources]
 *     summary: Filtrar por tipo
 *     parameters:
 *       - in: path
 *         name: tipo
 *         required: true
 *         schema:
 *           type: string
 *           enum: [SALA, ESCRITORIO, CONSULTORIO]
 *     responses:
 *       200:
 *         description: Recursos del tipo especificado
 *
 * /resources/{id}:
 *   get:
 *     tags: [Resources]
 *     summary: Obtener recurso por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Recurso encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Resource'
 *       404:
 *         description: Recurso no encontrado
 *
 *   put:
 *     tags: [Resources]
 *     summary: Actualizar recurso
 *     description: Solo ADMIN
 *     security:
 *       - bearerAuth: []
 *       - csrfToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               tipo:
 *                 type: string
 *                 enum: [SALA, ESCRITORIO, CONSULTORIO]
 *               capacidad:
 *                 type: integer
 *               descripcion:
 *                 type: string
 *     responses:
 *       200:
 *         description: Recurso actualizado
 *       404:
 *         description: Recurso no encontrado
 *
 *   delete:
 *     tags: [Resources]
 *     summary: Eliminar recurso (soft delete)
 *     description: Solo ADMIN
 *     security:
 *       - bearerAuth: []
 *       - csrfToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Recurso eliminado
 *       404:
 *         description: Recurso no encontrado
 *
 * /resources/{id}/reservations:
 *   get:
 *     tags: [Resources]
 *     summary: Recurso con sus reservas
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Recurso con reservas asociadas
 *       404:
 *         description: Recurso no encontrado
 *
 * /resources/{id}/restore:
 *   post:
 *     tags: [Resources]
 *     summary: Restaurar recurso
 *     description: Solo ADMIN
 *     security:
 *       - bearerAuth: []
 *       - csrfToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Recurso restaurado
 *       404:
 *         description: Recurso no encontrado
 *
 * /resources/{id}/toggle-active:
 *   patch:
 *     tags: [Resources]
 *     summary: Activar/Desactivar recurso
 *     description: Solo ADMIN
 *     security:
 *       - bearerAuth: []
 *       - csrfToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               activo:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Estado actualizado
 *       404:
 *         description: Recurso no encontrado
 */
