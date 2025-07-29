// src/infrastructure/web/area.routes.ts

/**
 * @swagger
 * tags:
 *   name: Areas
 *   description: Endpoints para gestión de áreas
 */

/**
 * @swagger
 * /api/areas:
 *   post:
 *     summary: Crear una nueva área
 *     tags: [Areas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Area'
 *     responses:
 *       201:
 *         description: Área creada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Area'
 *   get:
 *     summary: Obtener todas las áreas
 *     tags: [Areas]
 *     responses:
 *       200:
 *         description: Lista de áreas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Area'
 */

/**
 * @swagger
 * /api/areas/{id}:
 *   get:
 *     summary: Obtener un área por ID
 *     tags: [Areas]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del área
 *     responses:
 *       200:
 *         description: Área encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Area'
 *       404:
 *         description: Área no encontrada
 *   put:
 *     summary: Actualizar un área
 *     tags: [Areas]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del área
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Area'
 *     responses:
 *       200:
 *         description: Área actualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Area'
 *       404:
 *         description: Área no encontrada
 *   delete:
 *     summary: Eliminar un área
 *     tags: [Areas]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del área
 *     responses:
 *       204:
 *         description: Área eliminada
 *       404:
 *         description: Área no encontrada
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Area:
 *       type: object
 *       required:
 *         - name
 *         - companyId
 *       properties:
 *         id:
 *           type: string
 *           description: ID único del área
 *         name:
 *           type: string
 *         description:
 *           type: string
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
  createArea,
  getAreaById,
  getAllAreas,
  updateArea,
  deleteArea,
} from './area.controller';

const router = Router();

router.post('/', createArea);
router.get('/', getAllAreas);
router.get('/:id', getAreaById);
router.put('/:id', updateArea);
router.delete('/:id', deleteArea);

export default router;
