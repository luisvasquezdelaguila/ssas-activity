// src/domain/plan.entity.ts

export interface Plan {
  id: string;
  name: string;
  description?: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}
