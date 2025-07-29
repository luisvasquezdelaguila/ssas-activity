// src/infrastructure/db/oauth-access-token.model.ts

import mongoose, { Schema, Document } from 'mongoose';

export interface IOAuthAccessToken extends Document {
  tokenId: string; // ID único del token
  userId: string; // Cambiar de number a string para compatibilidad con ObjectId
  revoked: boolean;
  createdAt: Date;
  updatedAt: Date;
  user?: mongoose.Types.ObjectId;
  clientId?: number;
  name?: string;
  scopes?: string;
  fcmToken?: string;
  socketId?: string | null;
  device?: string;
  createdBy?: number;
  createdByText?: string;
  type?: string;
  expiresAt?: Date;
}

const OAuthAccessTokenSchema = new Schema<IOAuthAccessToken>({
  tokenId: { type: String, required: true, unique: true }, // ID único del token
  userId: { type: String, required: true }, // Cambiar de Number a String
  revoked: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  clientId: Number,
  name: String,
  scopes: String,
  fcmToken: String,
  socketId: { type: String, default: null },
  device: String,
  createdBy: Number,
  createdByText: String,
  type: String,
  expiresAt: Date,
}, {
  // Desactivar el _id automático y el __v
  _id: true,  // Mantener el _id automático de MongoDB
  versionKey: false
});

export const OAuthAccessTokenModel = mongoose.model<IOAuthAccessToken>('OAuthAccessToken', OAuthAccessTokenSchema);
