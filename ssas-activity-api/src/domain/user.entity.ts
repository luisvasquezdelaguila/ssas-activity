// src/domain/user.entity.ts

export type UserRole = 'super_admin' | 'company_admin' | 'operator' | 'user';

export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  role: UserRole;
  companyId?: string;
  areaId?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}
