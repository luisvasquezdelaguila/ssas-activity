// src/infrastructure/db/activity.model.ts

import mongoose, { Schema, Document } from 'mongoose';

export interface ActivityDocument extends Document {
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assignedTo: string;
  createdBy: string;
  startTime?: Date;
  endTime?: Date;
  statusHistory: Array<{
    status: string;
    changedBy: string;
    changedAt: Date;
    assignedTo?: string;
    startTime?: Date;
    endTime?: Date;
  }>;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

const ActivityStatusHistorySchema = new Schema({
  status: { type: String, required: true },
  changedBy: { type: String, required: true },
  changedAt: { type: Date, required: true },
  assignedTo: { type: String },
  startTime: { type: Date },
  endTime: { type: Date },
}, { _id: false });

const ActivitySchema = new Schema<ActivityDocument>({
  title: { type: String, required: true },
  description: { type: String },
  status: { type: String, required: true, enum: ['pending', 'in_progress', 'completed', 'cancelled'] },
  assignedTo: { type: String, required: true },
  createdBy: { type: String, required: true },
  startTime: { type: Date },
  endTime: { type: Date },
  statusHistory: { type: [ActivityStatusHistorySchema], default: [] },
  companyId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
});

const ActivityModel = mongoose.model<ActivityDocument>('Activity', ActivitySchema);
export default ActivityModel;
