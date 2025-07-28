// src/domain/plan.entity.ts

export interface Plan {
  id: string;
  name: string;
  description?: string;
  price: number;
  maxUsers: number; // -1 para ilimitado
  maxProjects: number; // -1 para ilimitado
  features: string[];
  companyId?: string; // Opcional - algunos planes pueden ser globales
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}
