// Variables de configuración de autenticación  
// dotenv ya se configura en index.ts
import { Algorithm } from 'jsonwebtoken';

interface AuthConfig {
  CLIENT_ID_LARAVEL_PASSPORT: number;
  algorithm: Algorithm;
  privateKey: string;
  publicKey: string;
  tokenDurationTotem: number;
  tokenDurationUser: number;
  tokenDurationSystem: number;
}

const authConfig: AuthConfig = {
  CLIENT_ID_LARAVEL_PASSPORT: 1,
  algorithm: 'RS256',
  privateKey: process.env.APP_PRIVATE_KEY || '',
  publicKey: process.env.APP_PUBLIC_KEY || '',
  tokenDurationTotem: 90, //days
  tokenDurationUser: 1, //days
  tokenDurationSystem: 365, //days - Este token se usa para consultar información desde sistemas externos
};

export default authConfig;
