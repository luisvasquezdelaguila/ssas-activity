// src/domain/area.entity.ts

export interface Area {
  id: string;
  name: string;
  description?: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}
