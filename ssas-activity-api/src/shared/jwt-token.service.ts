// src/shared/jwt-token.service.ts

import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import { OAuthAccessTokenModel } from '../infrastructure/db/oauth-access-token.model';
import authConfig from '../config/auth.config';
import moment from 'moment-timezone';
import appConfig from '../config/env/server';
import { generateUniqueTokenId } from './helper';
import { User } from '../domain/user.entity';
import UserModel from '../infrastructure/db/user.model';
import { toUserEntity } from './user-mapper';
import { OAuthAccessTokenEntity } from '../domain/oauth-access-token.entity';
import { toOAuthAccessTokenEntity } from './oauth-access-token-mapper';

export interface TokenOptions {
  user_id: string;
  id: string;
  createdAtToken: moment.Moment;
  expireInMoment: moment.Moment;
  scopes: string;
  name: string;
  fcm_token?: string;
  device?: string;
  created_by?: number;
  created_by_text?: string;
  type?: string;
}

export class JwtTokenService {
  static async signToken(payload: object, expiresIn = '7d'): Promise<string> {
    return jwt.sign(payload, authConfig.privateKey, {
      algorithm: authConfig.algorithm,
      expiresIn,
    } as any);
  }

  static async verifyToken(token: string): Promise<JwtPayload | string> {
    return new Promise((resolve, reject) => {
      jwt.verify(
        token,
        authConfig.publicKey,
        { algorithms: [authConfig.algorithm] } as any,
        (err, decoded) => {
          if (err) return reject(new Error('Token inválido'));
          resolve(decoded as JwtPayload | string);
        }
      );
    });
  }

  static async persistToken(options: TokenOptions) {
    const createdAtStr = options.createdAtToken.format('YYYY-MM-DD HH:mm:ss');
    await OAuthAccessTokenModel.create({
      id: options.id,
      userId: options['user_id'],
      clientId: authConfig.CLIENT_ID_LARAVEL_PASSPORT, // Por defecto para mantener compatibilidad con Laravel
      name: options.name,
      scopes: options.scopes,
      revoked: false,
      createdAt: options.createdAtToken.toDate(),
      updatedAt: options.createdAtToken.toDate(),
      expiresAt: options.expireInMoment.toDate(),
      fcmToken: options.fcm_token ? options.fcm_token : undefined,
      // socket_id: undefined,
      device: options.device ? options.device : undefined,
      createdBy: options.created_by,
      createdByText: options.created_by_text,
      type: options.type,
    });
  }

  static createToken(uniqueId: string, options: TokenOptions, expiresInDays: number): string {
    const expiresInSeconds = expiresInDays * 24 * 60 * 60;
    const jwtOptions: SignOptions = {
      jwtid: uniqueId,
      notBefore: '0h',
      expiresIn: expiresInSeconds,
      algorithm: authConfig.algorithm as any,
    };

    return jwt.sign(
      {
        aud: authConfig.CLIENT_ID_LARAVEL_PASSPORT,
        sub: options.user_id,
        scopes: options.scopes,
      },
      authConfig.privateKey,
      jwtOptions,
    );
  }

  static async validateToken(token: string) : Promise<{oAuthToken: OAuthAccessTokenEntity, user: User}> {
    const tokenValue = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
    const decoded = await this.verifyToken(tokenValue);
    // @ts-expect-error: decoded could be string or JwtPayload
    const oAuthToken = await OAuthAccessTokenModel.findOne({ id: decoded.jti });
    const user = await UserModel.findById(oAuthToken?.userId)
    if (!oAuthToken) {
      throw new Error('Token no válido o expirado');
    }
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    return {
        oAuthToken: toOAuthAccessTokenEntity(oAuthToken),
        user: toUserEntity(user), // Assuming toUserEntity is a function that maps UserModel to User entity
    }
  }

  static async buildTokenPayload(user: User): Promise<string> {
    let expiresInDays = authConfig.tokenDurationUser;
    let expireInMoment = moment.utc().tz(appConfig.timezone).add(expiresInDays, 'days');
    const createdAtToken = moment.utc().tz(appConfig.timezone);
    const uniqueId = await generateUniqueTokenId();

     let options : TokenOptions = {
      user_id: user.id,
      id: uniqueId,
      createdAtToken: createdAtToken,
      expireInMoment: expireInMoment,
      scopes: '["*"]',
      name: 'Personal Access Token',
    };
    await this.persistToken(options);
    const token = this.createToken(uniqueId, options, expiresInDays);
    return token;
  }
}
