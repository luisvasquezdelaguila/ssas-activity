// Modelo de área para empresas
export interface Area {
  id: string;
  name: string;
  description?: string;
  isActive?: boolean;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}
// Tipos principales del sistema
export type UserRole = 'super_admin' | 'company_admin' | 'operator' | 'user';

export interface User {
  id: string;
  email: string;
  name: string;
  password: string; // Hash de la contraseña
  role: UserRole;
  companyId?: string;
  areaId?: string; // área a la que pertenece el usuario
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface Company {
  id: string;
  name: string;
  domain: string;
  settings: CompanySettings;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface CompanySettings {
  timezone: string;
  workingHours: {
    start: string;
    end: string;
  };
  allowUserSelfRegistration: boolean;
}

export interface Activity {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  userId: string;
  companyId: string;
  areaId?: string; // área a la que pertenece la actividad
  createdAt: Date;
  updatedAt: Date;
}

// Tipos para formularios
export interface CreateUserData {
  email: string;
  name: string;
  password: string;
  role: UserRole;
  companyId?: string;
  areaId?: string; // área opcional al crear usuario
}

export interface UpdateUserData {
  name?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface CreateCompanyData {
  name: string;
  domain: string;
  adminEmail: string;
  adminName: string;
  adminPassword: string;
  settings?: {
    timezone?: string;
    workingHours?: {
      start?: string;
      end?: string;
    };
    allowUserSelfRegistration?: boolean;
  };
}

export interface UpdateCompanyData {
  name?: string;
  domain?: string;
  settings?: Partial<CompanySettings>;
  isActive?: boolean;
}

export interface CreateActivityData {
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
}

export interface UpdateActivityData {
  title?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
}

// Tipos para autenticación
export interface LoginData {
  email: string;
  password: string;
}

export interface AuthSession {
  userId: string;
  companyId?: string;
  token: string;
  expiresAt: Date;
}

// Tipos para reportes
export interface ActivityReport {
  totalActivities: number;
  totalHours: number;
  activitiesByUser: Record<string, number>;
  activitiesByDate: Record<string, number>;
}

export interface ReportFilters {
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  companyId?: string;
}

// Tipos para localStorage
export interface LocalStorageSchema {
  users: User[];
  companies: Company[];
  activities: Activity[];
  currentSession: AuthSession | null;
}

// Tipos para permisos
export interface Permission {
  resource: string;
  action: string;
  condition?: (user: User, resource?: any) => boolean;
}

export const PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    { resource: 'companies', action: 'create' },
    { resource: 'companies', action: 'read' },
    { resource: 'companies', action: 'update' },
    { resource: 'companies', action: 'delete' },
    { resource: 'users', action: 'read' },
    { resource: 'activities', action: 'read' },
  ],
  company_admin: [
    { resource: 'users', action: 'create', condition: (user, resource) => user.companyId === resource?.companyId },
    { resource: 'users', action: 'read', condition: (user, resource) => user.companyId === resource?.companyId },
    { resource: 'users', action: 'update', condition: (user, resource) => user.companyId === resource?.companyId },
    { resource: 'users', action: 'delete', condition: (user, resource) => user.companyId === resource?.companyId },
    { resource: 'activities', action: 'read', condition: (user, resource) => user.companyId === resource?.companyId },
    { resource: 'reports', action: 'read', condition: (user, resource) => user.companyId === resource?.companyId },
    { resource: 'company', action: 'update', condition: (user, resource) => user.companyId === resource?.id },
  ],
  operator: [
    { resource: 'activities', action: 'read', condition: (user, resource) => user.companyId === resource?.companyId },
    { resource: 'users', action: 'read', condition: (user, resource) => user.companyId === resource?.companyId },
  ],
  user: [
    { resource: 'activities', action: 'create', condition: (user, resource) => user.id === resource?.userId },
    { resource: 'activities', action: 'read', condition: (user, resource) => user.id === resource?.userId },
    { resource: 'activities', action: 'update', condition: (user, resource) => user.id === resource?.userId },
    { resource: 'activities', action: 'delete', condition: (user, resource) => user.id === resource?.userId },
    { resource: 'profile', action: 'read', condition: (user, resource) => user.id === resource?.id },
    { resource: 'profile', action: 'update', condition: (user, resource) => user.id === resource?.id },
  ],
};