import { User } from '@entities/user';

declare global {
  namespace Express {
    interface Request {
      auth?: User | null;
    }
  }
}

export {};
