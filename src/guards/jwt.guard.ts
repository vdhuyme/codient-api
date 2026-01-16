import { ExpressGuard } from '@inversifyjs/http-express';
import { UnauthorizedHttpResponse } from '@inversifyjs/http-core';
import Express from 'express';
import { tryCatch } from '@utils/try-catch';
import jwt from 'jsonwebtoken';
import { config } from '@config/app';

export class JwtGuard implements ExpressGuard {
  public async activate(req: Express.Request): Promise<boolean> {
    const [err, _] = tryCatch(() => {
      const token = this.extractTokenFromHeader(req);

      const decoded = jwt.verify(token, config.jwt.accessTokenSecretKey);
      return decoded;
    });

    if (err) {
      throw new UnauthorizedHttpResponse(
        { message: 'Authentication failed' },
        'Authentication failed',
      );
    }

    return true;
  }

  private extractTokenFromHeader(req: Express.Request): string {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedHttpResponse(
        { message: 'Missing token' },
        'Missing token',
      );
    }
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new UnauthorizedHttpResponse(
        { message: 'Invalid token format' },
        'Invalid token format',
      );
    }
    return parts[1];
  }
}
