// src/domain/activity.repository.ts

import { Activity, CreateActivityData, UpdateActivityStatusData, ReassignActivityData } from './activity.entity';

export interface IActivityRepository {
  create(activityData: CreateActivityData, createdBy: string, companyId: string): Promise<Activity>;
  findById(id: string): Promise<Activity | null>;
  findPendingByUser(userId: string): Promise<Activity[]>;
  findByUser(userId: string): Promise<Activity[]>;
  findPendingByPhone(phone: string): Promise<Activity[]>;
  updateStatus(id: string, statusData: UpdateActivityStatusData, updatedBy: string): Promise<Activity | null>;
  reassign(id: string, reassignData: ReassignActivityData, updatedBy: string): Promise<Activity | null>;
  findByCompany(companyId: string): Promise<Activity[]>;
  findAll(): Promise<Activity[]>;
  update(id: string, activity: Partial<Activity>): Promise<Activity | null>;
  delete(id: string): Promise<boolean>;
}
