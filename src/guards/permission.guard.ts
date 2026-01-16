import 'reflect-metadata';
import Express from 'express';
import { injectable, inject } from 'inversify';
import { ExpressGuard } from '@inversifyjs/http-express';
import {
  ForbiddenHttpResponse,
  UnauthorizedHttpResponse,
} from '@inversifyjs/http-core';
import { TYPES } from '@constants/types';
import {
  MatchMode,
  PERMISSIONS_KEY,
  PERMISSIONS_MATCH_MODE_KEY,
} from '@decorators/permissions';
import { Repository } from 'typeorm';
import { User } from '@entities/user';

@injectable()
export class PermissionGuard implements ExpressGuard {
  constructor(
    @inject(TYPES.DataSource)
    private readonly userRepository: Repository<User>,
  ) {}

  public async activate(req: Express.Request): Promise<boolean> {
    const handler = req.route?.handler;

    if (!handler) {
      return true;
    }

    const requiredPermissions: string[] =
      Reflect.getMetadata(PERMISSIONS_KEY, handler) ?? [];

    if (!requiredPermissions.length) {
      return true;
    }

    const matchMode: MatchMode = Reflect.getMetadata(
      PERMISSIONS_MATCH_MODE_KEY,
      handler,
    );

    const authUser = req.auth;
    if (!authUser) {
      throw new UnauthorizedHttpResponse(
        { message: 'Missing user identity' },
        'Missing user identity',
      );
    }

    const user = await this.userRepository.findOne({
      where: { id: authUser.id },
      relations: { roles: { permissions: true }, permissions: true },
    });
    if (!user) {
      throw new UnauthorizedHttpResponse(
        { message: 'User not found' },
        'User not found',
      );
    }

    const userPermissions = new Set<string>();
    user.permissions.forEach((p) => userPermissions.add(p.code));
    user.roles.forEach((role) => {
      role.permissions.forEach((p) => userPermissions.add(p.code));
    });

    const allowed =
      matchMode === 'all'
        ? requiredPermissions.every((p) => userPermissions.has(p))
        : requiredPermissions.some((p) => userPermissions.has(p));

    if (!allowed) {
      throw new ForbiddenHttpResponse(
        {
          message: `Required permissions: ${requiredPermissions.join(', ')}`,
        },
        'Forbidden',
      );
    }

    return true;
  }
}
