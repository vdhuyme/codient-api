import 'reflect-metadata';
import { Request } from 'express';
import { injectable } from 'inversify';
import { ExpressGuard } from '@inversifyjs/http-express';
import {
  ForbiddenHttpResponse,
  UnauthorizedHttpResponse,
} from '@inversifyjs/http-core';
import {
  MatchMode,
  PERMISSIONS_KEY,
  PERMISSIONS_MATCH_MODE_KEY,
} from '@decorators';

@injectable()
export class PermissionGuard implements ExpressGuard {
  public async activate(req: Request): Promise<boolean> {
    const handler = req.route?.handler;

    const requiredPermissions: string[] =
      Reflect.getMetadata(PERMISSIONS_KEY, handler) ?? [];
    const matchMode: MatchMode =
      Reflect.getMetadata(PERMISSIONS_MATCH_MODE_KEY, handler) ?? 'any';

    const user = req.auth;

    if (!user) {
      throw new UnauthorizedHttpResponse(
        { message: 'User not authenticated' },
        'Unauthorized',
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
