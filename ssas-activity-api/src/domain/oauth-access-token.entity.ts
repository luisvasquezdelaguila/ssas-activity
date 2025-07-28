// src/domain/oauth-access-token.entity.ts

import { User } from './user.entity';

export interface OAuthAccessTokenEntity {
  id: string;
  userId: string; // Cambiar de number a string para compatibilidad con ObjectId
  revoked: boolean;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
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
