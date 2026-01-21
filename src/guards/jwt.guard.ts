import { ExpressGuard } from '@inversifyjs/http-express';
import Express from 'express';
import { tryCatch } from '@utils';
import jwt from 'jsonwebtoken';
import { config } from '@config';
import { UnauthorizedException } from '@exceptions';
import { Repository } from 'typeorm';
import { User } from '@entities';
import { BaseStatus } from '@constants';
import { injectRepository } from '@decorators';
import { UnauthorizedHttpResponse } from '@inversifyjs/http-core';

export class JwtGuard implements ExpressGuard {
  constructor(
    @injectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  public async activate(req: Express.Request): Promise<boolean> {
    const [err, data] = tryCatch(() => {
      const token = this.extractTokenFromHeader(req);

      const decoded = jwt.verify(token, config.jwt.accessTokenSecretKey);
      return decoded as { userId: string; email: string; status: BaseStatus };
    });

    if (err) {
      throw new UnauthorizedException();
    }

    const user = await this.userRepository.findOne({
      where: { id: data.userId },
      relations: { roles: { permissions: true }, permissions: true },
    });

    if (!user) {
      throw new UnauthorizedHttpResponse(
        { message: 'User not found' },
        'User not found',
      );
    }

    req.auth = user;

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
