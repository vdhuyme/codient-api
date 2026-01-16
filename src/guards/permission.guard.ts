import 'reflect-metadata'
import Express from 'express'
import { injectable, inject } from 'inversify'
import { ExpressGuard } from '@inversifyjs/http-express'
import { ForbiddenHttpResponse, UnauthorizedHttpResponse } from '@inversifyjs/http-core'
import { IUserRepository } from '@repositories/contracts/user.repository.interface'
import { TYPES } from '@constants/types'
import { ROLES_PERMISSIONS } from '@config/permissions'
import { MatchMode, PERMISSIONS_KEY, PERMISSIONS_MATCH_MODE_KEY } from '@decorators/permissions'

@injectable()
export class PermissionGuard implements ExpressGuard {
  constructor(
    @inject(TYPES.UserRepository)
    private readonly userRepository: IUserRepository
  ) {}

  public async activate(req: Express.Request): Promise<boolean> {
    const handler = req.route?.handler

    if (!handler) {
      return true
    }

    const requiredPermissions: string[] = Reflect.getMetadata(PERMISSIONS_KEY, handler) ?? []

    if (requiredPermissions.length === 0) {
      return true
    }

    const matchMode: MatchMode = Reflect.getMetadata(PERMISSIONS_MATCH_MODE_KEY, handler)

    const { id } = req.auth ?? {}
    if (!id) {
      throw new UnauthorizedHttpResponse(
        { message: 'Missing user identity' },
        'Missing user identity'
      )
    }

    const user = await this.userRepository.findById(id)
    if (!user) {
      throw new UnauthorizedHttpResponse({ message: 'User not found' }, 'User not found')
    }

    const userPermissions = new Set(
      user.roles?.flatMap(role => ROLES_PERMISSIONS[role] ?? []) ?? []
    )

    const allowed =
      matchMode === 'all'
        ? requiredPermissions.every(p => userPermissions.has(p))
        : requiredPermissions.some(p => userPermissions.has(p))

    if (!allowed) {
      throw new ForbiddenHttpResponse(
        {
          message: `Required permissions: ${requiredPermissions.join(', ')}`
        },
        'Forbidden'
      )
    }

    return true
  }
}
