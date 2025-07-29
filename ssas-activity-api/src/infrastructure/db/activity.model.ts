// src/infrastructure/db/activity.model.ts

import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ActivityDocument extends Document {
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assignedTo: Types.ObjectId;
  createdBy: Types.ObjectId;
  startTime?: Date;
  endTime?: Date;
  statusHistory: Array<{
    status: string;
    changedBy: Types.ObjectId;
    changedAt: Date;
    assignedTo?: Types.ObjectId;
    startTime?: Date;
    endTime?: Date;
  }>;
  companyId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

const ActivityStatusHistorySchema = new Schema({
  status: { type: String, required: true },
  changedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  changedAt: { type: Date, required: true },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  startTime: { type: Date },
  endTime: { type: Date },
}, { _id: false });

const ActivitySchema = new Schema<ActivityDocument>({
  title: { type: String, required: true },
  description: { type: String },
  status: { type: String, required: true, enum: ['pending', 'in_progress', 'completed', 'cancelled'] },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  startTime: { type: Date },
  endTime: { type: Date },
  statusHistory: { type: [ActivityStatusHistorySchema], default: [] },
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
});

const ActivityModel = mongoose.model<ActivityDocument>('Activity', ActivitySchema);
export default ActivityModel;
