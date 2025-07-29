// src/shared/activity-mapper.ts

import { Activity, ActivityStatusHistory, User, Company } from '../domain/activity.entity';
import { ActivityDocument } from '../infrastructure/db/activity.model';

function mapUserField(field: any): string | User {
  if (!field) return '';
  
  if (typeof field === 'string') {
    // Si es un ObjectId o string, retornamos el ID
    return field;
  }
  
  // Si está populado, retornamos el objeto User
  return {
    id: field._id?.toString() || field.id,
    name: field.name,
    email: field.email,
    phone: field.phone,
    role: field.role,
  };
}

function mapCompanyField(field: any): string | Company {
  if (!field) return '';
  
  if (typeof field === 'string' || field._id) {
    // Si es un ObjectId o string, retornamos el ID
    return typeof field === 'string' ? field : field._id.toString();
  }
  
  // Si está populado, retornamos el objeto Company
  return {
    id: field._id?.toString() || field.id,
    name: field.name,
    domain: field.domain,
  };
}

export function toActivityEntity(document: ActivityDocument): Activity {
  return {
    id: document._id?.toString(),
    title: document.title,
    description: document.description,
    status: document.status,
    assignedTo: mapUserField(document.assignedTo),
    createdBy: mapUserField(document.createdBy),
    startTime: document.startTime,
    endTime: document.endTime,
    statusHistory: document.statusHistory.map(history => ({
      status: history.status as any,
      changedBy: mapUserField(history.changedBy),
      changedAt: history.changedAt,
      assignedTo: history.assignedTo ? mapUserField(history.assignedTo) : undefined,
      startTime: history.startTime,
      endTime: history.endTime,
    })),
    companyId: mapCompanyField(document.companyId),
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
