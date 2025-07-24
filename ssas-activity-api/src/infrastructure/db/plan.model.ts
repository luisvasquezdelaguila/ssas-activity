// src/infrastructure/db/plan.model.ts

import mongoose, { Schema, Document } from 'mongoose';
import { Plan } from '../../domain/plan.entity';

export interface PlanDocument extends Document {
  name: string;
  description?: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

const PlanSchema = new Schema<PlanDocument>({
  name: { type: String, required: true },
  description: { type: String },
  companyId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
});

const PlanModel = mongoose.model<PlanDocument>('Plan', PlanSchema);
export default PlanModel;
