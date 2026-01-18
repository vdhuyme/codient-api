import { ExpressGuard } from '@inversifyjs/http-express';
import Express from 'express';
import { tryCatch } from '@utils';
import jwt from 'jsonwebtoken';
import { config } from '@config';
import { UnauthorizedException } from '@exceptions';

export class JwtGuard implements ExpressGuard {
  public async activate(req: Express.Request): Promise<boolean> {
    const [err, _] = tryCatch(() => {
      const token = this.extractTokenFromHeader(req);

      const decoded = jwt.verify(token, config.jwt.accessTokenSecretKey);
      return decoded;
    });

    if (err) {
      throw new UnauthorizedException();
    }

    return true;
  }

  private extractTokenFromHeader(req: Express.Request): string {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException();
    }
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new UnauthorizedException();
    }
    return parts[1];
  }
}
