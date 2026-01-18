import { BAD_REQUEST } from '@constants/http.status.code';

export class HttpException extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly args?: Record<string, unknown>;

  public constructor(option: {
    message: string;
    code?: string | number;
    args?: Record<string, unknown>;
    statusCode?: number;
  }) {
    super(option.message);
    this.name = this.constructor.name;
    this.args = option.args;
    this.code = option.code ? String(option.code) : this.name;
    this.statusCode = option.statusCode ?? BAD_REQUEST;

    Object.setPrototypeOf(this, new.target.prototype);
  }

  public getStatus(): number {
    return this.statusCode;
  }
}
