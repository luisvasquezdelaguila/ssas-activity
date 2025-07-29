// src/infrastructure/repositories/plan.repository.ts

import { IPlanRepository } from '../../domain/plan.repository';
import { Plan } from '../../domain/plan.entity';
import PlanModel from '../db/plan.model';

function toPlan(doc: any): Plan {
  const obj = doc.toObject();
  return {
    ...obj,
    id: obj._id.toString(),
    _id: undefined,
    __v: undefined,
  };
}

export class PlanRepository implements IPlanRepository {
  async create(plan: Plan): Promise<Plan> {
    const created = await PlanModel.create(plan);
    return toPlan(created);
  }

  async findById(id: string): Promise<Plan | null> {
    const found = await PlanModel.findById(id);
    return found ? toPlan(found) : null;
  }

  async findAll(): Promise<Plan[]> {
    const plans = await PlanModel.find();
    return plans.map((p: any) => toPlan(p));
  }

  async update(id: string, plan: Partial<Plan>): Promise<Plan | null> {
    const updated = await PlanModel.findByIdAndUpdate(id, plan, { new: true });
    return updated ? toPlan(updated) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await PlanModel.findByIdAndDelete(id);
    return !!result;
  }
}
