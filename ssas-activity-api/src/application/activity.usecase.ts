// src/application/activity.usecase.ts

import { IActivityRepository } from '../domain/activity.repository';
import { Activity } from '../domain/activity.entity';

export class ActivityUseCase {
  constructor(private activityRepo: IActivityRepository) {}

  async createActivity(data: Omit<Activity, 'id'>): Promise<Activity> {
    return this.activityRepo.create(data);
  }

  async getActivityById(id: string): Promise<Activity | null> {
    return this.activityRepo.findById(id);
  }

  async getAllActivities(): Promise<Activity[]> {
    return this.activityRepo.findAll();
  }

  async updateActivity(id: string, data: Partial<Activity>): Promise<Activity | null> {
    return this.activityRepo.update(id, data);
  }

  async deleteActivity(id: string): Promise<boolean> {
    return this.activityRepo.delete(id);
  }
}
