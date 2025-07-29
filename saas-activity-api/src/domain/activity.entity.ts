// src/domain/activity.entity.ts

export type ActivityStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
}

export interface Company {
  id: string;
  name: string;
  domain: string;
}

export interface ActivityStatusHistory {
  status: ActivityStatus;
  changedBy: string | User;
  changedAt: Date;
  assignedTo?: string | User;
  startTime?: Date;
  endTime?: Date;
}

export interface Activity {
  id?: string;
  title: string;
  description?: string;
  status: ActivityStatus;
  assignedTo: string | User;
  createdBy: string | User;
  startTime?: Date;
  endTime?: Date;
  statusHistory: ActivityStatusHistory[];
  companyId: string | Company;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface CreateActivityData {
  title: string;
  description?: string;
  assignedTo?: string; // Opcional - si no se proporciona se asigna al creador
  startTime?: Date;
  endTime?: Date;
}

export interface UpdateActivityStatusData {
  status: ActivityStatus;
  startTime?: Date;
  endTime?: Date;
}

export interface ReassignActivityData {
  assignedTo: string;
}
