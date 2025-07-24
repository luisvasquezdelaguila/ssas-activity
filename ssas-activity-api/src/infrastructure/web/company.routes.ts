/**
 * @swagger
 * tags:
 *   name: Companies
 *   description: Endpoints para gestión de empresas
 */

/**
 * @swagger
 * /api/companies:
 *   post:
 *     summary: Crear una nueva empresa
 *     tags: [Companies]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Company'
 *     responses:
 *       201:
 *         description: Empresa creada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Company'
 *   get:
 *     summary: Obtener todas las empresas
 *     tags: [Companies]
 *     responses:
 *       200:
 *         description: Lista de empresas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Company'
 */

/**
 * @swagger
 * /api/companies/{id}:
 *   get:
 *     summary: Obtener una empresa por ID
 *     tags: [Companies]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la empresa
 *     responses:
 *       200:
 *         description: Empresa encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Company'
 *       404:
 *         description: Empresa no encontrada
 *   put:
 *     summary: Actualizar una empresa
 *     tags: [Companies]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la empresa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Company'
 *     responses:
 *       200:
 *         description: Empresa actualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Company'
 *       404:
 *         description: Empresa no encontrada
 *   delete:
 *     summary: Eliminar una empresa
 *     tags: [Companies]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la empresa
 *     responses:
 *       204:
 *         description: Empresa eliminada
 *       404:
 *         description: Empresa no encontrada
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Company:
 *       type: object
 *       required:
 *         - name
 *         - domain
 *         - settings
 *       properties:
 *         id:
 *           type: string
 *           description: ID único de la empresa
 *         name:
 *           type: string
 *         domain:
 *           type: string
 *         settings:
 *           type: object
 *           properties:
 *             timezone:
 *               type: string
 *             workingHours:
 *               type: object
 *               properties:
 *                 start:
 *                   type: string
 *                 end:
 *                   type: string
 *             allowUserSelfRegistration:
 *               type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         isActive:
 *           type: boolean
 */
// src/infrastructure/web/company.routes.ts

import { Router } from 'express';
import {
  createCompany,
  getCompanyById,
  getAllCompanies,
  updateCompany,
  deleteCompany,
} from './company.controller';

const router = Router();

router.post('/', createCompany);
router.get('/', getAllCompanies);
router.get('/:id', getCompanyById);
router.put('/:id', updateCompany);
router.delete('/:id', deleteCompany);

export default router;
