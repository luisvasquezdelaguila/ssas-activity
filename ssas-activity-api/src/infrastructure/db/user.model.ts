// src/infrastructure/db/user.model.ts

import mongoose, { Schema, Document } from 'mongoose';
import { UserRole } from '../../domain/user.entity';

export interface UserDocument extends Document {
  email: string;
  name: string;
  password: string;
  role: UserRole;
  companyId?: string;
  areaId?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

const UserSchema = new Schema<UserDocument>({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  companyId: { type: String },
  areaId: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
});

const UserModel = mongoose.model<UserDocument>('User', UserSchema);
export default UserModel;
