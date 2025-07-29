// src/infrastructure/db/user.model.ts

import mongoose, { Schema, Document } from 'mongoose';
import { UserRole } from '../../domain/user.entity';

export interface UserDocument extends Document {
  email: string;
  name: string;
  password: string;
  phone: string;
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
  phone: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v: string) {
        // Validar formato de teléfono con código de país (ej: +51987654321)
        return /^\+\d{1,4}\d{6,15}$/.test(v);
      },
      message: 'El teléfono debe incluir código de país (ej: +51987654321)'
    }
  },
  role: { type: String, required: true },
  companyId: { type: String },
  areaId: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
});

const UserModel = mongoose.model<UserDocument>('User', UserSchema);
export default UserModel;
