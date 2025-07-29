// src/infrastructure/web/plan.controller.ts

import { Request, Response } from 'express';
import { PlanUseCase } from '../../application/plan.usecase';
import { PlanRepository } from '../repositories/plan.repository';

const planUseCase = new PlanUseCase(new PlanRepository());

export const createPlan = async (req: Request, res: Response) => {
  try {
    const plan = await planUseCase.createPlan(req.body);
    res.status(201).json(plan);
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

export const getPlanById = async (req: Request, res: Response) => {
  try {
    const plan = await planUseCase.getPlanById(req.params.id);
    if (!plan) return res.status(404).json({ error: 'Plan not found' });
    res.json(plan);
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

export const getAllPlans = async (_req: Request, res: Response) => {
  try {
    const plans = await planUseCase.getAllPlans();
    res.json(plans);
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

export const updatePlan = async (req: Request, res: Response) => {
  try {
    const plan = await planUseCase.updatePlan(req.params.id, req.body);
    if (!plan) return res.status(404).json({ error: 'Plan not found' });
    res.json(plan);
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

export const deletePlan = async (req: Request, res: Response) => {
  try {
    const success = await planUseCase.deletePlan(req.params.id);
    if (!success) return res.status(404).json({ error: 'Plan not found' });
    res.status(204).send();
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};
