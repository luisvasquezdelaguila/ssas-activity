// src/infrastructure/db/company.model.ts


import mongoose, { Schema, Document } from 'mongoose';
import { CompanySettings } from '../../domain/company.entity';

export interface CompanyDocument extends Document {
  name: string;
  domain: string;
  settings: CompanySettings;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

const CompanySettingsSchema = new Schema<CompanySettings>({
  timezone: { type: String, required: true },
  workingHours: {
    start: { type: String, required: true },
    end: { type: String, required: true },
  },
  allowUserSelfRegistration: { type: Boolean, required: true },
});

const CompanySchema = new Schema<CompanyDocument>({
  name: { type: String, required: true },
  domain: { type: String, required: true },
  settings: { type: CompanySettingsSchema, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
});

const CompanyModel = mongoose.model<CompanyDocument>('Company', CompanySchema);
export default CompanyModel;
