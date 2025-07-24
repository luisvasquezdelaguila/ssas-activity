// src/infrastructure/repositories/activity.repository.ts

import { IActivityRepository } from '../../domain/activity.repository';
import { Activity } from '../../domain/activity.entity';
import ActivityModel from '../db/activity.model';

function toActivity(doc: any): Activity {
  const obj = doc.toObject();
  return {
    ...obj,
    id: obj._id.toString(),
    _id: undefined,
    __v: undefined,
    statusHistory: obj.statusHistory || [],
  };
}

export class ActivityRepository implements IActivityRepository {
  async create(activity: Activity): Promise<Activity> {
    const created = await ActivityModel.create(activity);
    return toActivity(created);
  }

  async findById(id: string): Promise<Activity | null> {
    const found = await ActivityModel.findById(id);
    return found ? toActivity(found) : null;
  }

  async findAll(): Promise<Activity[]> {
    const activities = await ActivityModel.find();
    return activities.map((a: any) => toActivity(a));
  }

  async update(id: string, activity: Partial<Activity>): Promise<Activity | null> {
    const updated = await ActivityModel.findByIdAndUpdate(id, activity, { new: true });
    return updated ? toActivity(updated) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await ActivityModel.findByIdAndDelete(id);
    return !!result;
  }
}
