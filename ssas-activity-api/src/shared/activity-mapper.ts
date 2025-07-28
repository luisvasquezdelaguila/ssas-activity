// src/shared/activity-mapper.ts

import { Activity, ActivityStatusHistory } from '../domain/activity.entity';
import { ActivityDocument } from '../infrastructure/db/activity.model';

export function toActivityEntity(document: ActivityDocument): Activity {
  return {
    id: document._id?.toString(),
    title: document.title,
    description: document.description,
    status: document.status,
    assignedTo: document.assignedTo,
    createdBy: document.createdBy,
    startTime: document.startTime,
    endTime: document.endTime,
    statusHistory: document.statusHistory.map(history => ({
      status: history.status as any,
      changedBy: history.changedBy,
      changedAt: history.changedAt,
      assignedTo: history.assignedTo,
      startTime: history.startTime,
      endTime: history.endTime,
    })),
    companyId: document.companyId,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
    isActive: document.isActive,
  };
}

export function toActivityDocument(activity: Partial<Activity>): Partial<ActivityDocument> {
  const doc: any = {};
  
  if (activity.title !== undefined) doc.title = activity.title;
  if (activity.description !== undefined) doc.description = activity.description;
  if (activity.status !== undefined) doc.status = activity.status;
  if (activity.assignedTo !== undefined) doc.assignedTo = activity.assignedTo;
  if (activity.createdBy !== undefined) doc.createdBy = activity.createdBy;
  if (activity.startTime !== undefined) doc.startTime = activity.startTime;
  if (activity.endTime !== undefined) doc.endTime = activity.endTime;
  if (activity.statusHistory !== undefined) doc.statusHistory = activity.statusHistory;
  if (activity.companyId !== undefined) doc.companyId = activity.companyId;
  if (activity.isActive !== undefined) doc.isActive = activity.isActive;
  
  return doc;
}
