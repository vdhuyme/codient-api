import { UNPROCESSABLE_ENTITY } from '@constants/http.status.code';
import { ValidationError } from 'express-validator';

export default class ValidationException extends Error {
  public status: number;
  public errors: ValidationError[];

  constructor(errors: ValidationError[]) {
    super('Validation failed');
    this.name = 'ValidationException';
    this.status = UNPROCESSABLE_ENTITY;
    this.errors = errors;
  }
}
