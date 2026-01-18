import { User } from '@entities';

declare global {
  namespace Express {
    interface Request {
      auth?: User | null;
    }
  }
}

export {};
