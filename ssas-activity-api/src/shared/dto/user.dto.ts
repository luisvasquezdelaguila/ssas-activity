// src/shared/dto/user.dto.ts

export interface CreateUserRequest {
  email: string;
  name: string;
  password: string;
  phone: string;
  role: 'super_admin' | 'company_admin' | 'operator' | 'user';
  companyId?: string;
  areaId?: string;
}

export interface UpdateUserRequest {
  email?: string;
  name?: string;
  password?: string;
  phone?: string;
  role?: 'super_admin' | 'company_admin' | 'operator' | 'user';
  companyId?: string;
  areaId?: string;
  isActive?: boolean;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: string;
  companyId?: string;
  areaId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
