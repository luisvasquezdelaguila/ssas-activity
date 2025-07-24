// src/domain/activity.repository.ts

import { Activity } from './activity.entity';

export interface IActivityRepository {
  create(activity: Activity): Promise<Activity>;
  findById(id: string): Promise<Activity | null>;
  findAll(): Promise<Activity[]>;
  update(id: string, activity: Partial<Activity>): Promise<Activity | null>;
  delete(id: string): Promise<boolean>;
}
