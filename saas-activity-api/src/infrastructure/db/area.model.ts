// src/infrastructure/db/area.model.ts

import mongoose, { Schema, Document } from 'mongoose';

export interface AreaDocument extends Document {
  name: string;
  description?: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

const AreaSchema = new Schema<AreaDocument>({
  name: { type: String, required: true },
  description: { type: String },
  companyId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
});

const AreaModel = mongoose.model<AreaDocument>('Area', AreaSchema);
export default AreaModel;
