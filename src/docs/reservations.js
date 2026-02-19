/**
 * @swagger
 * /reservations:
 *   get:
 *     tags: [Reservations]
 *     summary: Listar reservas
 *     description: Obtiene todas las reservas con paginación y filtros
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
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: resourceId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDIENTE, CONFIRMADA, CANCELADA]
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Lista paginada de reservas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *
 *   post:
 *     tags: [Reservations]
 *     summary: Crear reserva
 *     description: Crea una nueva reserva (requiere autenticación + CSRF)
 *     security:
 *       - bearerAuth: []
 *       - csrfToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [resource_id, start_time, end_time]
 *             properties:
 *               resource_id:
 *                 type: string
 *                 format: uuid
 *               start_time:
 *                 type: string
 *                 format: date-time
 *                 example: '2026-03-01T09:00:00Z'
 *               end_time:
 *                 type: string
 *                 format: date-time
 *                 example: '2026-03-01T10:00:00Z'
 *     responses:
 *       201:
 *         description: Reserva creada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Reservation'
 *       400:
 *         description: Datos inválidos
 *       409:
 *         description: Conflicto de horario
 *
 * /reservations/today:
 *   get:
 *     tags: [Reservations]
 *     summary: Reservas de hoy
 *     parameters:
 *       - in: query
 *         name: resourceId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Reservas del día actual
 *
 * /reservations/stats:
 *   get:
 *     tags: [Reservations]
 *     summary: Estadísticas de reservas
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: resourceId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Estadísticas de reservas
 *
 * /reservations/user/{userId}:
 *   get:
 *     tags: [Reservations]
 *     summary: Reservas de un usuario
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDIENTE, CONFIRMADA, CANCELADA]
 *       - in: query
 *         name: upcoming
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Reservas del usuario
 *
 * /reservations/resource/{resourceId}:
 *   get:
 *     tags: [Reservations]
 *     summary: Reservas de un recurso
 *     parameters:
 *       - in: path
 *         name: resourceId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDIENTE, CONFIRMADA, CANCELADA]
 *     responses:
 *       200:
 *         description: Reservas del recurso
 *
 * /reservations/{id}:
 *   get:
 *     tags: [Reservations]
 *     summary: Obtener reserva por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Reserva encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Reservation'
 *       404:
 *         description: Reserva no encontrada
 *
 *   put:
 *     tags: [Reservations]
 *     summary: Actualizar reserva
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
 *               start_time:
 *                 type: string
 *                 format: date-time
 *               end_time:
 *                 type: string
 *                 format: date-time
 *               resource_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Reserva actualizada
 *       404:
 *         description: Reserva no encontrada
 *       409:
 *         description: Conflicto de horario
 *
 *   delete:
 *     tags: [Reservations]
 *     summary: Eliminar reserva (soft delete)
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
 *         description: Reserva eliminada
 *       404:
 *         description: Reserva no encontrada
 *
 * /reservations/{id}/cancel:
 *   post:
 *     tags: [Reservations]
 *     summary: Cancelar reserva
 *     description: Solo el dueño de la reserva o un ADMIN pueden cancelar
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
 *         description: Reserva cancelada
 *       403:
 *         description: Sin permisos
 *       404:
 *         description: Reserva no encontrada
 *
 * /reservations/{id}/confirm:
 *   post:
 *     tags: [Reservations]
 *     summary: Confirmar reserva
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
 *         description: Reserva confirmada
 *       400:
 *         description: No se puede confirmar
 *       404:
 *         description: Reserva no encontrada
 *
 * /reservations/{id}/restore:
 *   post:
 *     tags: [Reservations]
 *     summary: Restaurar reserva eliminada
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
 *         description: Reserva restaurada
 *       404:
 *         description: Reserva no encontrada
 */
