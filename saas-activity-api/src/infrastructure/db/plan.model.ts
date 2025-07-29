// src/infrastructure/db/plan.model.ts

import mongoose, { Schema, Document } from 'mongoose';
import { Plan } from '../../domain/plan.entity';

export interface PlanDocument extends Document {
  name: string;
  description?: string;
  price: number;
  maxUsers: number; // -1 para ilimitado
  maxProjects: number; // -1 para ilimitado
  features: string[];
  companyId?: string; // Opcional - algunos planes pueden ser globales
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

const PlanSchema = new Schema<PlanDocument>({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true, min: 0 },
  maxUsers: { type: Number, required: true, min: -1 },
  maxProjects: { type: Number, required: true, min: -1 },
  features: [{ type: String }],
  companyId: { type: String, required: false }, // Opcional para planes globales
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
});

const PlanModel = mongoose.model<PlanDocument>('Plan', PlanSchema);
export default PlanModel;
