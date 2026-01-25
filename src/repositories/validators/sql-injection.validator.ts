import { Filtering } from '@domain';

export class SqlInjectionValidator {
  private readonly DANGEROUS_PATTERNS = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\b)/gi,
    /(--|;|\/\*|\*\/|'|"|`)/g,
  ];

  public validate(filter: Filtering): string | null {
    const combinedText = this.combinedText(filter);
    const hasDangerousPattern = this.DANGEROUS_PATTERNS.some((pattern) =>
      pattern.test(combinedText),
    );
    return hasDangerousPattern ? 'Potential SQL injection detected' : null;
  }

  private combinedText(filter: Filtering): string {
    const value = filter.value;
    const property = filter.property;
    return `${property} ${value}`;
  }
}
