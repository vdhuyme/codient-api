import jsonwebtoken from '@config/jsonwebtoken'
import UnauthorizedException from '@exceptions/unauthorized.exception'
import { IJwtAuthUserPayload } from 'interfaces'
import { NextFunction, Request, Response } from 'express'
import { BASE_STATUS } from '@constants/base.status'

const verifyAccountAccess = (status: string): void => {
  if (!status || status !== BASE_STATUS.ACTIVATED) {
    throw new UnauthorizedException('Your account has been blocked')
  }
}

const getTokenFromHeader = (req: Request): string => {
  const authHeader = req.headers.authorization
  if (!authHeader) {
    throw new UnauthorizedException('Missing token')
  }

  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    throw new UnauthorizedException('Invalid token format')
  }

  return parts[1]
}

export function auth() {
  return function (_target: unknown, _propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function (req: Request, res: Response, next: NextFunction) {
      try {
        const token = getTokenFromHeader(req)

        const decoded = jsonwebtoken.verify(token) as IJwtAuthUserPayload
        verifyAccountAccess(decoded.status)

        req.auth = decoded

        return await originalMethod.call(this, req, res, next)
      } catch (error) {
        const messages: Record<string, string> = {
          JsonWebTokenError: 'Invalid token',
          TokenExpiredError: 'Token has expired',
          NotBeforeError: 'Token not active yet',
          JsonSchemaError: 'Token format invalid'
        }

        const name = (error as { name?: string }).name
        const message = messages[name ?? ''] || 'Exception from authenticated middleware'

        next(new UnauthorizedException(message))
      }
    }

    return descriptor
  }
}
