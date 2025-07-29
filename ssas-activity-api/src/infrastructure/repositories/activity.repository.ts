// src/infrastructure/repositories/activity.repository.ts

import { IActivityRepository } from '../../domain/activity.repository';
import { Activity, CreateActivityData, UpdateActivityStatusData, ReassignActivityData } from '../../domain/activity.entity';
import ActivityModel from '../db/activity.model';
import { toActivityEntity } from '../../shared/activity-mapper';

export class ActivityRepository implements IActivityRepository {
  
  async create(activityData: CreateActivityData, createdBy: string, companyId: string): Promise<Activity> {
    const newActivity = await ActivityModel.create({
      ...activityData,
      status: 'pending',
      createdBy,
      companyId,
      statusHistory: [{
        status: 'pending',
        changedBy: createdBy,
        changedAt: new Date(),
        assignedTo: activityData.assignedTo,
        startTime: activityData.startTime,
        endTime: activityData.endTime,
      }]
    });

    return toActivityEntity(newActivity);
  }

  async findById(id: string): Promise<Activity | null> {
    const activity = await ActivityModel.findById(id)
      .where({ isActive: true })
      .populate('assignedTo', 'name email phone role')
      .populate('createdBy', 'name email phone role')
      .populate('companyId', 'name domain')
      .populate('statusHistory.changedBy', 'name email')
      .populate('statusHistory.assignedTo', 'name email');
    
    return activity ? toActivityEntity(activity) : null;
  }

  async findPendingByUser(userId: string): Promise<Activity[]> {
    const activities = await ActivityModel.find({
      assignedTo: userId,
      status: 'pending',
      isActive: true
    })
      .populate('assignedTo', 'name email phone role')
      .populate('createdBy', 'name email phone role')
      .populate('companyId', 'name domain')
      .sort({ createdAt: -1 });

    return activities.map(toActivityEntity);
  }

  async findByUser(userId: string): Promise<Activity[]> {
    const activities = await ActivityModel.find({
      assignedTo: userId,
      isActive: true
    })
      .populate('assignedTo', 'name email phone role')
      .populate('createdBy', 'name email phone role')
      .populate('companyId', 'name domain')
      .sort({ createdAt: -1 });

    return activities.map(toActivityEntity);
  }

  async findPendingByPhone(phone: string): Promise<Activity[]> {
    // Primero necesitamos encontrar el usuario por teléfono
    const UserModel = require('../db/user.model').default;
    const user = await UserModel.findOne({ phone });
    
    if (!user) {
      return [];
    }

    const activities = await ActivityModel.find({
      assignedTo: user._id,
      status: 'pending',
      isActive: true
    })
      .populate('assignedTo', 'name email phone role')
      .populate('createdBy', 'name email phone role')
      .populate('companyId', 'name domain')
      .sort({ createdAt: -1 });

    return activities.map(toActivityEntity);
  }

  async updateStatus(id: string, statusData: UpdateActivityStatusData, updatedBy: string): Promise<Activity | null> {
    const activity = await ActivityModel.findById(id);
    if (!activity || !activity.isActive) {
      return null;
    }

    // Agregar entrada al historial
    const historyEntry = {
      status: statusData.status,
      changedBy: updatedBy,
      changedAt: new Date(),
      assignedTo: activity.assignedTo,
      startTime: statusData.startTime || activity.startTime,
      endTime: statusData.endTime || activity.endTime,
    };

    const updatedActivity = await ActivityModel.findByIdAndUpdate(
      id,
      {
        status: statusData.status,
        startTime: statusData.startTime || activity.startTime,
        endTime: statusData.endTime || activity.endTime,
        updatedAt: new Date(),
        $push: { statusHistory: historyEntry }
      },
      { new: true }
    )
      .populate('assignedTo', 'name email phone role')
      .populate('createdBy', 'name email phone role')
      .populate('companyId', 'name domain');

    return updatedActivity ? toActivityEntity(updatedActivity) : null;
  }

  async reassign(id: string, reassignData: ReassignActivityData, updatedBy: string): Promise<Activity | null> {
    const activity = await ActivityModel.findById(id);
    if (!activity || !activity.isActive) {
      return null;
    }

    // Agregar entrada al historial
    const historyEntry = {
      status: activity.status,
      changedBy: updatedBy,
      changedAt: new Date(),
      assignedTo: reassignData.assignedTo,
      startTime: activity.startTime,
      endTime: activity.endTime,
    };

    const updatedActivity = await ActivityModel.findByIdAndUpdate(
      id,
      {
        assignedTo: reassignData.assignedTo,
        updatedAt: new Date(),
        $push: { statusHistory: historyEntry }
      },
      { new: true }
    )
      .populate('assignedTo', 'name email phone role')
      .populate('createdBy', 'name email phone role')
      .populate('companyId', 'name domain');

    return updatedActivity ? toActivityEntity(updatedActivity) : null;
  }

  async findByCompany(companyId: string): Promise<Activity[]> {
    const activities = await ActivityModel.find({
      companyId,
      isActive: true
    })
      .populate('assignedTo', 'name email phone role')
      .populate('createdBy', 'name email phone role')
      .populate('companyId', 'name domain')
      .sort({ createdAt: -1 });

    return activities.map(toActivityEntity);
  }

  async findAll(): Promise<Activity[]> {
    const activities = await ActivityModel.find({ isActive: true })
      .populate('assignedTo', 'name email phone role')
      .populate('createdBy', 'name email phone role')
      .populate('companyId', 'name domain')
      .sort({ createdAt: -1 });
      
    return activities.map(toActivityEntity);
  }

  async update(id: string, activityData: Partial<Activity>): Promise<Activity | null> {
    const updatedActivity = await ActivityModel.findByIdAndUpdate(
      id,
      { ...activityData, updatedAt: new Date() },
      { new: true }
    )
      .populate('assignedTo', 'name email phone role')
      .populate('createdBy', 'name email phone role')
      .populate('companyId', 'name domain');

    return updatedActivity ? toActivityEntity(updatedActivity) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await ActivityModel.findByIdAndUpdate(
      id,
      { isActive: false, updatedAt: new Date() },
      { new: true }
    );

    return !!result;
  }
}
