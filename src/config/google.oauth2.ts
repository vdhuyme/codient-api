import { OAuth2Client } from 'google-auth-library';
import { config } from '@config/app';

export const googleOAuth2Client = new OAuth2Client(
  config.google.clientId,
  config.google.clientSecret,
  config.google.redirectUri,
);

export interface OAuthUser {
  providerId: string;
  email: string;
  name: string;
  avatar?: string;
  accessToken: string;
  refreshToken: string;
}

export type OAuthProvider = 'google';

export interface OAuthRequest extends Request {
  user: OAuthUser;
}
