// src/domain/activity.entity.ts

export type ActivityStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface ActivityStatusHistory {
  status: ActivityStatus;
  changedBy: string;
  changedAt: Date;
  assignedTo?: string;
  startTime?: Date;
  endTime?: Date;
}

export interface Activity {
  id?: string;
  title: string;
  description?: string;
  status: ActivityStatus;
  assignedTo: string;
  createdBy: string;
  startTime?: Date;
  endTime?: Date;
  statusHistory: ActivityStatusHistory[];
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}
