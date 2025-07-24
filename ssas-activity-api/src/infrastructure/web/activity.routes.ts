// src/infrastructure/web/activity.routes.ts

/**
 * @swagger
 * tags:
 *   name: Activities
 *   description: Endpoints para gestión de actividades
 */

/**
 * @swagger
 * /api/activities:
 *   post:
 *     summary: Crear una nueva actividad
 *     tags: [Activities]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Activity'
 *     responses:
 *       201:
 *         description: Actividad creada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Activity'
 *   get:
 *     summary: Obtener todas las actividades
 *     tags: [Activities]
 *     responses:
 *       200:
 *         description: Lista de actividades
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Activity'
 */

/**
 * @swagger
 * /api/activities/{id}:
 *   get:
 *     summary: Obtener una actividad por ID
 *     tags: [Activities]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la actividad
 *     responses:
 *       200:
 *         description: Actividad encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Activity'
 *       404:
 *         description: Actividad no encontrada
 *   put:
 *     summary: Actualizar una actividad
 *     tags: [Activities]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la actividad
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Activity'
 *     responses:
 *       200:
 *         description: Actividad actualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Activity'
 *       404:
 *         description: Actividad no encontrada
 *   delete:
 *     summary: Eliminar una actividad
 *     tags: [Activities]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la actividad
 *     responses:
 *       204:
 *         description: Actividad eliminada
 *       404:
 *         description: Actividad no encontrada
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Activity:
 *       type: object
 *       required:
 *         - title
 *         - status
 *         - assignedTo
 *         - createdBy
 *         - companyId
 *       properties:
 *         id:
 *           type: string
 *           description: ID único de la actividad
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         status:
 *           type: string
 *           enum: [pending, in_progress, completed, cancelled]
 *         assignedTo:
 *           type: string
 *           description: ID del usuario asignado
 *         createdBy:
 *           type: string
 *           description: ID del usuario que creó el ticket
 *         startTime:
 *           type: string
 *           format: date-time
 *         endTime:
 *           type: string
 *           format: date-time
 *         statusHistory:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, completed, cancelled]
 *               changedBy:
 *                 type: string
 *               changedAt:
 *                 type: string
 *                 format: date-time
 *               assignedTo:
 *                 type: string
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *         companyId:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         isActive:
 *           type: boolean
 */

import { Router } from 'express';
import {
  createActivity,
  getActivityById,
  getAllActivities,
  updateActivity,
  deleteActivity,
} from './activity.controller';

const router = Router();

router.post('/', createActivity);
router.get('/', getAllActivities);
router.get('/:id', getActivityById);
router.put('/:id', updateActivity);
router.delete('/:id', deleteActivity);

export default router;
