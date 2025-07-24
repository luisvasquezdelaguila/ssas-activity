/**
 * @swagger
 * tags:
 *   name: Plans
 *   description: Endpoints para gestión de planes
 */

/**
 * @swagger
 * /api/plans:
 *   post:
 *     summary: Crear un nuevo plan
 *     tags: [Plans]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Plan'
 *     responses:
 *       201:
 *         description: Plan creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Plan'
 *   get:
 *     summary: Obtener todos los planes
 *     tags: [Plans]
 *     responses:
 *       200:
 *         description: Lista de planes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Plan'
 */

/**
 * @swagger
 * /api/plans/{id}:
 *   get:
 *     summary: Obtener un plan por ID
 *     tags: [Plans]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del plan
 *     responses:
 *       200:
 *         description: Plan encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Plan'
 *       404:
 *         description: Plan no encontrado
 *   put:
 *     summary: Actualizar un plan
 *     tags: [Plans]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del plan
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Plan'
 *     responses:
 *       200:
 *         description: Plan actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Plan'
 *       404:
 *         description: Plan no encontrado
 *   delete:
 *     summary: Eliminar un plan
 *     tags: [Plans]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del plan
 *     responses:
 *       204:
 *         description: Plan eliminado
 *       404:
 *         description: Plan no encontrado
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Plan:
 *       type: object
 *       required:
 *         - name
 *         - companyId
 *       properties:
 *         id:
 *           type: string
 *           description: ID único del plan
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
  createPlan,
  getPlanById,
  getAllPlans,
  updatePlan,
  deletePlan,
} from './plan.controller';

const router = Router();

router.post('/', createPlan);
router.get('/', getAllPlans);
router.get('/:id', getPlanById);
router.put('/:id', updatePlan);
router.delete('/:id', deletePlan);

export default router;
