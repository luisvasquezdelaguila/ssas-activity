// src/infrastructure/web/activity.routes.ts

import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import {
  createActivity,
  getActivityById,
  getPendingActivities,
  getMyActivities,
  updateActivityStatus,
  reassignActivity,
  getCompanyActivities
} from './activity.controller';

/**
 * @swagger
 * components:
 *   schemas:
 *     Activity:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID único de la actividad
 *         title:
 *           type: string
 *           description: Título de la actividad
 *         description:
 *           type: string
 *           description: Descripción detallada de la actividad
 *         status:
 *           type: string
 *           enum: [pending, in_progress, completed, cancelled]
 *           description: Estado actual de la actividad
 *         assignedTo:
 *           type: string
 *           description: ID del usuario asignado
 *         createdBy:
 *           type: string
 *           description: ID del usuario que creó la actividad
 *         startTime:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de inicio
 *         endTime:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de finalización
 *         statusHistory:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ActivityStatusHistory'
 *         companyId:
 *           type: string
 *           description: ID de la compañía
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         isActive:
 *           type: boolean
 *           description: Indica si la actividad está activa
 *     ActivityStatusHistory:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [pending, in_progress, completed, cancelled]
 *         changedBy:
 *           type: string
 *           description: ID del usuario que cambió el estado
 *         changedAt:
 *           type: string
 *           format: date-time
 *         assignedTo:
 *           type: string
 *           description: ID del usuario asignado en este momento
 *         startTime:
 *           type: string
 *           format: date-time
 *         endTime:
 *           type: string
 *           format: date-time
 *     CreateActivityRequest:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         title:
 *           type: string
 *           description: Título de la actividad
 *           minLength: 1
 *           maxLength: 255
 *         description:
 *           type: string
 *           description: Descripción de la actividad
 *           maxLength: 1000
 *         assignedTo:
 *           type: string
 *           format: uuid
 *           description: ID del usuario asignado (opcional - si no se proporciona se asigna al creador)
 *         status:
 *           type: string
 *           enum: [pending, in_progress, completed, cancelled]
 *           default: pending
 *           description: Estado inicial de la actividad
 *         startTime:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de inicio (requerida para estados 'in_progress' y 'completed')
 *         endTime:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de finalización (requerida para estado 'completed')
 *     UpdateActivityStatusRequest:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [pending, in_progress, completed, cancelled]
 *           description: Nuevo estado de la actividad
 *         startTime:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de inicio real
 *         endTime:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de finalización real
 *     ReassignActivityRequest:
 *       type: object
 *       required:
 *         - assignedTo
 *       properties:
 *         assignedTo:
 *           type: string
 *           description: ID del nuevo usuario asignado
 *     ApiResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: object
 *         error:
 *           type: string
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

const router = Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticateToken);

/**
 * @swagger
 * /api/activities:
 *   post:
 *     summary: Crear nueva actividad
 *     description: |
 *       Permite crear una nueva actividad con diferentes estados iniciales:
 *       - **pending**: Para actividades futuras (requiere startTime en el futuro)
 *       - **in_progress**: Para actividades que ya están en curso (requiere startTime)
 *       - **completed**: Para registrar actividades ya terminadas (requiere startTime y endTime)
 *       
 *       Si no se especifica assignedTo, se asigna automáticamente al usuario creador.
 *       Valida que el usuario asignado exista y pertenezca a la misma compañía.
 *     tags: [Activities]

 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateActivityRequest'
 *           examples:
 *             pending_activity:
 *               summary: Actividad pendiente para el futuro
 *               value:
 *                 title: "Reunión de planificación"
 *                 description: "Planificar el sprint próximo"
 *                 status: "pending"
 *                 startTime: "2024-02-20T10:00:00Z"
 *             completed_activity:
 *               summary: Actividad ya completada (registro histórico)
 *               value:
 *                 title: "Revisión de código"
 *                 description: "Revisar PR #123"
 *                 assignedTo: "user789"
 *                 status: "completed"
 *                 startTime: "2024-01-15T14:00:00Z"
 *                 endTime: "2024-01-15T15:30:00Z"
 *             simple_activity:
 *               summary: Actividad simple (se asigna automáticamente al creador)
 *               value:
 *                 title: "Actualizar documentación"
 *                 description: "Actualizar README del proyecto"
 *     responses:
 *       201:
 *         description: Actividad creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         activity:
 *                           $ref: '#/components/schemas/Activity'
 *       400:
 *         description: Error en validación de datos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 details:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                       message:
 *                         type: string
 *             examples:
 *               validation_error:
 *                 summary: Error de validación
 *                 value:
 *                   error: "Datos inválidos"
 *                   details:
 *                     - field: "title"
 *                       message: "El título es requerido"
 *               user_not_found:
 *                 summary: Usuario asignado no válido
 *                 value:
 *                   error: "El usuario asignado no existe o no pertenece a la misma compañía"
 *       401:
 *         description: Token de autenticación inválido o ausente
 */
// Crear nueva actividad
router.post('/', createActivity);

/**
 * @swagger
 * /api/activities/pending:
 *   get:
 *     summary: Obtener actividades pendientes del usuario
 *     description: Retorna todas las actividades pendientes asignadas al usuario autenticado
 *     tags: [Activities]

 *     responses:
 *       200:
 *         description: Lista de actividades pendientes obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         activities:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Activity'
 *       401:
 *         description: Token de autenticación inválido o ausente
 */
// Obtener actividades pendientes del usuario autenticado
router.get('/pending', getPendingActivities);

/**
 * @swagger
 * /api/activities/my-activities:
 *   get:
 *     summary: Obtener todas las actividades del usuario
 *     description: Retorna todas las actividades asignadas al usuario autenticado, independientemente de su estado
 *     tags: [Activities]

 *     responses:
 *       200:
 *         description: Lista de actividades del usuario obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         activities:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Activity'
 *       401:
 *         description: Token de autenticación inválido o ausente
 */
// Obtener todas las actividades del usuario autenticado
router.get('/my-activities', getMyActivities);

/**
 * @swagger
 * /api/activities/company:
 *   get:
 *     summary: Obtener todas las actividades de la compañía (Solo administradores)
 *     description: Retorna todas las actividades de la compañía. Solo accesible por usuarios con rol de administrador
 *     tags: [Activities]

 *     responses:
 *       200:
 *         description: Lista de actividades de la compañía obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         activities:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Activity'
 *       401:
 *         description: Token de autenticación inválido o ausente
 *       403:
 *         description: Usuario sin permisos de administrador
 */
// Obtener todas las actividades de la compañía (solo admins)
router.get('/company', getCompanyActivities);

/**
 * @swagger
 * /api/activities/{id}:
 *   get:
 *     summary: Obtener actividad por ID
 *     description: Retorna los detalles de una actividad específica por su ID
 *     tags: [Activities]

 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID único de la actividad
 *     responses:
 *       200:
 *         description: Actividad obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         activity:
 *                           $ref: '#/components/schemas/Activity'
 *       404:
 *         description: Actividad no encontrada
 *       401:
 *         description: Token de autenticación inválido o ausente
 */
// Obtener actividad por ID
router.get('/:id', getActivityById);

/**
 * @swagger
 * /api/activities/{id}/status:
 *   patch:
 *     summary: Actualizar estado de la actividad
 *     description: |
 *       Permite actualizar el estado de una actividad con validaciones automáticas:
 *       - **in_progress**: Requiere startTime
 *       - **completed**: Requiere startTime y endTime
 *       - Valida transiciones de estado permitidas
 *       - Valida que startTime sea anterior a endTime
 *     tags: [Activities]

 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID único de la actividad
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateActivityStatusRequest'
 *           examples:
 *             start_activity:
 *               summary: Iniciar actividad
 *               value:
 *                 status: "in_progress"
 *                 startTime: "2024-01-15T09:15:00Z"
 *             complete_activity:
 *               summary: Completar actividad
 *               value:
 *                 status: "completed"
 *                 startTime: "2024-01-15T09:15:00Z"
 *                 endTime: "2024-01-15T17:30:00Z"
 *     responses:
 *       200:
 *         description: Estado de la actividad actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         activity:
 *                           $ref: '#/components/schemas/Activity'
 *       400:
 *         description: Error en validación de datos o transición de estado inválida
 *       404:
 *         description: Actividad no encontrada
 *       401:
 *         description: Token de autenticación inválido o ausente
 */
// Actualizar estado de la actividad
router.patch('/:id/status', updateActivityStatus);

/**
 * @swagger
 * /api/activities/{id}/reassign:
 *   patch:
 *     summary: Reasignar actividad
 *     description: |
 *       Permite cambiar el usuario asignado a una actividad. 
 *       Valida que el nuevo usuario exista y pertenezca a la misma compañía.
 *       No permite reasignar actividades completadas.
 *     tags: [Activities]

 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID único de la actividad
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReassignActivityRequest'
 *           example:
 *             assignedTo: "user789"
 *     responses:
 *       200:
 *         description: Actividad reasignada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         activity:
 *                           $ref: '#/components/schemas/Activity'
 *       400:
 *         description: Error en validación de datos o usuario no válido
 *       404:
 *         description: Actividad no encontrada
 *       401:
 *         description: Token de autenticación inválido o ausente
 */
// Reasignar actividad
router.patch('/:id/reassign', reassignActivity);

export default router;
