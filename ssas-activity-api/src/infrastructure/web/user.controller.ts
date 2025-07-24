// src/infrastructure/web/user.controller.ts

import { Request, Response } from 'express';
import { UserUseCase } from '../../application/user.usecase';
import { UserRepository } from '../repositories/user.repository';

const userUseCase = new UserUseCase(new UserRepository());

export const createUser = async (req: Request, res: Response) => {
  try {
    const user = await userUseCase.createUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await userUseCase.getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

export const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const users = await userUseCase.getAllUsers();
    res.json(users);
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const user = await userUseCase.updateUser(req.params.id, req.body);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const success = await userUseCase.deleteUser(req.params.id);
    if (!success) return res.status(404).json({ error: 'User not found' });
    res.status(204).send();
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};
