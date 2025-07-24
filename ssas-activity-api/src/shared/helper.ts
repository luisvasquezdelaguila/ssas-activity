import crypto from 'crypto';
// import { OAuthAccessTokenRepository } from '..';
import { OAuthAccessTokenModel } from '../infrastructure/db/oauth-access-token.model';

export const generateRandomTokenId = (length: number): string => {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let randomString = '';

  const randomValues = crypto.randomBytes(length); // Genera bytes aleatorios seguros

  for (let i = 0; i < length; i++) {
    randomString += characters.charAt(randomValues[i] % charactersLength);
  }

  return randomString;
};


export const generateUniqueTokenId = async (): Promise<string> => {
  let maxAttempts = 10;
    let exists = true;
    let uniqueId = '';
    while (maxAttempts-- > 0) {
      uniqueId = generateRandomTokenId(80);
      const oauthToken = await OAuthAccessTokenModel.findOne({ _id: uniqueId });
      if (!oauthToken) {
        break;
      }
    }

    if (maxAttempts == 0 && exists) {
      throw new Error('Error generando ID único para el token');
    }
    return uniqueId;
};

