// src/shared/oauth-access-token-mapper.ts

import { OAuthAccessTokenEntity } from '../domain/oauth-access-token.entity';
import { IOAuthAccessToken } from '../infrastructure/db/oauth-access-token.model';
import { User } from '../domain/user.entity'; // Ajusta si es interface

export function toOAuthAccessTokenEntity(model: IOAuthAccessToken): OAuthAccessTokenEntity {
  return {
    id: model._id?.toString() ?? model.id,
    userId: model.userId,
    revoked: model.revoked,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
    user: typeof model.user === 'object' &&
      model.user !== null &&
      'email' in model.user &&
      'name' in model.user &&
      'password' in model.user &&
      'role' in model.user &&
      'companyId' in model.user &&
      'areaId' in model.user &&
      'isActive' in model.user
      ? {
          id: model.user._id?.toString() ?? model.user.id,
          email: model.user.email,
          name: (model.user as any).name,
          password: (model.user as any).password,
          role: (model.user as any).role,
          companyId: (model.user as any).companyId,
          areaId: (model.user as any).areaId,
          isActive: (model.user as any).isActive,
        } as User
      : undefined,
    clientId: model.clientId,
    name: model.name,
    scopes: model.scopes,
    fcmToken: model.fcmToken,
    socketId: model.socketId,
    device: model.device,
    createdBy: model.createdBy,
    createdByText: model.createdByText,
    type: model.type,
    expiresAt: model.expiresAt,
  };
}
