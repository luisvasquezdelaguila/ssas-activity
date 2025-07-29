// src/domain/plan.repository.ts

import { Plan } from './plan.entity';

export interface IPlanRepository {
  create(plan: Plan): Promise<Plan>;
  findById(id: string): Promise<Plan | null>;
  findAll(): Promise<Plan[]>;
  update(id: string, plan: Partial<Plan>): Promise<Plan | null>;
  delete(id: string): Promise<boolean>;
}
