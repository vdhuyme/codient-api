import slugify from 'slugify';
import { injectable } from 'inversify';
import { nanoid } from 'nanoid';
import HttpException from '@exceptions/http.exception';

import { tryCatch } from './try-catch';

interface GenerateSlugOptions {
  text: string;
  prefix?: boolean;
  suffix?: boolean;
}

export interface ISlugify {
  generate(options: GenerateSlugOptions): string;
}

@injectable()
export class Slugify implements ISlugify {
  public constructor() {}

  public generate(options: GenerateSlugOptions): string {
    const [err, slug] = tryCatch(() => {
      const common = slugify(options.text, { lower: true, strict: true });

      const prefixed = options.prefix ? `${nanoid(10)}-${common}` : common;
      const completed = options.suffix ? `${prefixed}-${nanoid(10)}` : prefixed;

      return completed;
    });

    if (err) {
      throw new HttpException({
        message: 'Failed to generate slug',
        code: 'SLUGIFY_GENERATE_FAILED',
        statusCode: 500,
      });
    }

    return slug;
  }
}
