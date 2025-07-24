// src/infrastructure/web/activity.controller.ts

import { Request, Response } from 'express';
import { ActivityUseCase } from '../../application/activity.usecase';
import { ActivityRepository } from '../repositories/activity.repository';
import { ActivityStatus } from '../../domain/activity.entity';

const activityUseCase = new ActivityUseCase(new ActivityRepository());

export const createActivity = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      assignedTo,
      createdBy,
      companyId,
    } = req.body;

    const now = new Date();
    const activityData = {
      title,
      description,
      status: 'pending' as ActivityStatus,
      assignedTo,
      createdBy,
      companyId,
      statusHistory: [{
        status: 'pending' as ActivityStatus,
        changedBy: createdBy,
        changedAt: now,
        assignedTo,
      }],
      createdAt: now,
      updatedAt: now,
      isActive: true,
    };

    const activity = await activityUseCase.createActivity(activityData);
    res.status(201).json(activity);
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

export const getActivityById = async (req: Request, res: Response) => {
  try {
    const activity = await activityUseCase.getActivityById(req.params.id);
    if (!activity) return res.status(404).json({ error: 'Activity not found' });
    res.json(activity);
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

export const getAllActivities = async (_req: Request, res: Response) => {
  try {
    const activities = await activityUseCase.getAllActivities();
    res.json(activities);
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

export const updateActivity = async (req: Request, res: Response) => {
  try {
    const activity = await activityUseCase.updateActivity(req.params.id, req.body);
    if (!activity) return res.status(404).json({ error: 'Activity not found' });
    res.json(activity);
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

export const deleteActivity = async (req: Request, res: Response) => {
  try {
    const success = await activityUseCase.deleteActivity(req.params.id);
    if (!success) return res.status(404).json({ error: 'Activity not found' });
    res.status(204).send();
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};
