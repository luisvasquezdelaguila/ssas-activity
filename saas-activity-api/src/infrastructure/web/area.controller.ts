// src/infrastructure/web/area.controller.ts

import { Request, Response } from 'express';
import { AreaUseCase } from '../../application/area.usecase';
import { AreaRepository } from '../repositories/area.repository';

const areaUseCase = new AreaUseCase(new AreaRepository());

export const createArea = async (req: Request, res: Response) => {
  try {
    const area = await areaUseCase.createArea(req.body);
    res.status(201).json(area);
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

export const getAreaById = async (req: Request, res: Response) => {
  try {
    const area = await areaUseCase.getAreaById(req.params.id);
    if (!area) return res.status(404).json({ error: 'Area not found' });
    res.json(area);
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

export const getAllAreas = async (_req: Request, res: Response) => {
  try {
    const areas = await areaUseCase.getAllAreas();
    res.json(areas);
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

export const updateArea = async (req: Request, res: Response) => {
  try {
    const area = await areaUseCase.updateArea(req.params.id, req.body);
    if (!area) return res.status(404).json({ error: 'Area not found' });
    res.json(area);
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

export const deleteArea = async (req: Request, res: Response) => {
  try {
    const success = await areaUseCase.deleteArea(req.params.id);
    if (!success) return res.status(404).json({ error: 'Area not found' });
    res.status(204).send();
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};
