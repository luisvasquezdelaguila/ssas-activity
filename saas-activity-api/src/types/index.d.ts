import { User } from '../../domain/user.entity';
import { OAuthAccessTokenEntity } from '../domain/oauth-access-token.entity';

declare global {
  namespace Express {
    interface Request {
      user?: User;
      oAuthAccessToken: OAuthAccessTokenEntity;
      token: string;
      oauth_access_token_id?: string;
      extra_data?: Record<string, unknown>;
    }
  }
}
