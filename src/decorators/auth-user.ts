import {
  createCustomParameterDecorator,
  UnauthorizedHttpResponse,
} from '@inversifyjs/http-core';
import { Request } from 'express';
import { User } from '@entities';

export const AuthUser = createCustomParameterDecorator<Request, unknown, User>(
  (request: Request): User => {
    const user = request.auth;

    if (!user) {
      throw new UnauthorizedHttpResponse(
        { message: 'Not found auth user in request!' },
        'Not found auth user in request!',
      );
    }

    return user;
  },
);
