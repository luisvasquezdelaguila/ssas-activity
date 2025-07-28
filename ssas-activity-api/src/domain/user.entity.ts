// src/domain/user.entity.ts

export type UserRole = 'super_admin' | 'company_admin' | 'operator' | 'user';

export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  phone: string; // Número de teléfono con código de país (ej: +51987654321)
  role: UserRole;
  companyId?: string;
  areaId?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}
