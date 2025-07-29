// src/infrastructure/web/activity.controller.ts

import { Request, Response } from 'express';
import { ActivityUseCases } from '../../application/activity.usecase';
import { ActivityRepository } from '../repositories/activity.repository';
import { UserRepository } from '../repositories/user.repository';
import { 
  createActivitySchema, 
  updateActivityStatusSchema, 
  reassignActivitySchema,
  CreateActivityInput,
  UpdateActivityStatusInput,
  ReassignActivityInput
} from '../../shared/validators/activity.validator';

const activityRepository = new ActivityRepository();
const userRepository = new UserRepository();
const activityUseCases = new ActivityUseCases(activityRepository, userRepository);

export const createActivity = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user; // Usuario autenticado

    if (!user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    // Validar entrada con Zod
    const validationResult = createActivitySchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Datos inválidos',
        details: validationResult.error.issues.map((issue: any) => ({
          field: issue.path.join('.'),
          message: issue.message
        }))
      });
    }

    const validatedData: CreateActivityInput = validationResult.data;

    const activity = await activityUseCases.createActivity(
      validatedData,
      user.id,
      user.companyId
    );

    res.status(201).json({
      success: true,
      data: { activity }
    });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const getActivityById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const activity = await activityUseCases.getActivityById(id);

    if (!activity) {
      return res.status(404).json({ error: 'Actividad no encontrada' });
    }

    res.json({
      success: true,
      data: { activity }
    });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const getPendingActivities = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    const activities = await activityUseCases.getPendingActivitiesByUser(user.id);

    res.json({
      success: true,
      data: { activities }
    });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const getMyActivities = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    const activities = await activityUseCases.getActivitiesByUser(user.id);

    res.json({
      success: true,
      data: { activities }
    });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const updateActivityStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    // Validar entrada con Zod
    const validationResult = updateActivityStatusSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Datos inválidos',
        details: validationResult.error.issues.map((issue: any) => ({
          field: issue.path.join('.'),
          message: issue.message
        }))
      });
    }

    const validatedData: UpdateActivityStatusInput = validationResult.data;

    const activity = await activityUseCases.updateActivityStatus(id, validatedData, user.id);

    if (!activity) {
      return res.status(404).json({ error: 'Actividad no encontrada' });
    }

    res.json({
      success: true,
      data: { activity }
    });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const reassignActivity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    // Validar entrada con Zod
    const validationResult = reassignActivitySchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Datos inválidos',
        details: validationResult.error.issues.map((issue: any) => ({
          field: issue.path.join('.'),
          message: issue.message
        }))
      });
    }

    const validatedData: ReassignActivityInput = validationResult.data;

    const activity = await activityUseCases.reassignActivity(id, validatedData, user.id, user.companyId);

    if (!activity) {
      return res.status(404).json({ error: 'Actividad no encontrada' });
    }

    res.json({
      success: true,
      data: { activity }
    });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const getCompanyActivities = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    // Solo admins pueden ver todas las actividades de la compañía
    if (!['super_admin', 'company_admin'].includes(user.role)) {
      return res.status(403).json({ error: 'No tienes permisos para ver todas las actividades' });
    }

    const activities = await activityUseCases.getActivitiesByCompany(user.companyId);

    res.json({
      success: true,
      data: { activities }
    });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};
