import bcrypt from 'bcryptjs';
import { config } from '@config';
import { injectable } from 'inversify';

@injectable()
export class Hash {
  public constructor(public readonly salt: number = config.hash.salt) {}

  public async make(data: string): Promise<string> {
    return bcrypt.hash(data, this.salt);
  }

  public async check(data: string, encrypted: string): Promise<boolean> {
    return bcrypt.compare(data, encrypted);
  }
}
