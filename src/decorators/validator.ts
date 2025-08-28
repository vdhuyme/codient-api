import { Request, Response, NextFunction } from 'express'
import { validationResult, ValidationChain, ValidationError, Result } from 'express-validator'
import ValidationException from '@exceptions/validation.exception'

export function validate(validations: ValidationChain[]) {
  return function (_target: unknown, _propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function (req: Request, res: Response, next: NextFunction) {
      try {
        await Promise.all(validations.map(validation => validation.run(req)))

        const errors: Result<ValidationError> = validationResult(req)
        if (!errors.isEmpty()) {
          return next(new ValidationException(errors.array()))
        }

        return await originalMethod.call(this, req, res, next)
      } catch (error) {
        next(error)
      }
    }

    return descriptor
  }
}
