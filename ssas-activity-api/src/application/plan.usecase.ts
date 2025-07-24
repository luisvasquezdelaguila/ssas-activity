// src/application/plan.usecase.ts

import { IPlanRepository } from '../domain/plan.repository';
import { Plan } from '../domain/plan.entity';

export class PlanUseCase {
  constructor(private planRepo: IPlanRepository) {}

  async createPlan(data: Plan): Promise<Plan> {
    return this.planRepo.create(data);
  }

  async getPlanById(id: string): Promise<Plan | null> {
    return this.planRepo.findById(id);
  }

  async getAllPlans(): Promise<Plan[]> {
    return this.planRepo.findAll();
  }

  async updatePlan(id: string, data: Partial<Plan>): Promise<Plan | null> {
    return this.planRepo.update(id, data);
  }

  async deletePlan(id: string): Promise<boolean> {
    return this.planRepo.delete(id);
  }
}
