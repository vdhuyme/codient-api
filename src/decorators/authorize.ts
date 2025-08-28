import { Request, Response, NextFunction } from 'express'
import UnauthorizedException from '@exceptions/unauthorized.exception'
import { getRepository } from '@utils/container'
import { IUserRepository } from '@repositories/contracts/user.repository.interface'
import { TYPES } from '@constants/types'
import { ROLES_PERMISSIONS } from '@config/permissions'
import { FORBIDDEN } from '@constants/http.status.code'

export function roles(required: string[] | string, mode: 'every' | 'some' = 'every') {
  return function (_target: unknown, _propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function (req: Request, res: Response, next: NextFunction) {
      const { userId } = req.auth || {}
      if (!userId) {
        return next(new UnauthorizedException('Missing user identity'))
      }

      const userRepository = getRepository<IUserRepository>(TYPES.UserRepository)
      const user = await userRepository.findById(userId)
      if (!user) {
        return next(new UnauthorizedException('User not found'))
      }

      const requiredRoles = Array.isArray(required) ? required : [required]
      const userRoles = user.roles || []

      const isAuthorized =
        mode === 'every'
          ? requiredRoles.every(role => userRoles.includes(role))
          : requiredRoles.some(role => userRoles.includes(role))

      if (!isAuthorized) {
        return next(new UnauthorizedException('Insufficient role access', FORBIDDEN))
      }

      return await originalMethod.call(this, req, res, next)
    }

    return descriptor
  }
}

export function permissions(required: string[] | string, mode: 'every' | 'some' = 'every') {
  return function (_target: unknown, _propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function (req: Request, res: Response, next: NextFunction) {
      const { userId } = req.auth || {}
      if (!userId) {
        return next(new UnauthorizedException('Missing user identity'))
      }

      const userRepository = getRepository<IUserRepository>(TYPES.UserRepository)
      const user = await userRepository.findById(userId)
      if (!user) {
        return next(new UnauthorizedException('User not found'))
      }

      const permissions = user.roles?.flatMap(role => ROLES_PERMISSIONS[role] || []) || []
      const uniquePermissions = new Set(permissions)
      const requiredPermissions = Array.isArray(required) ? required : [required]

      const isAuthorized =
        mode === 'every'
          ? requiredPermissions.every(p => uniquePermissions.has(p))
          : requiredPermissions.some(p => uniquePermissions.has(p))

      if (!isAuthorized) {
        return next(new UnauthorizedException('Insufficient permission access', FORBIDDEN))
      }

      return await originalMethod.call(this, req, res, next)
    }

    return descriptor
  }
}
