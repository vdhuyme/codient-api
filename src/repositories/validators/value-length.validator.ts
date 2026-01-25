export class ValueLengthValidator {
  private readonly MAX_LENGTH = 255;

  public validate(value: string): string | null {
    const exceedsLimit = Boolean(value && value.length > this.MAX_LENGTH);
    return exceedsLimit
      ? `Value length exceeds maximum of ${this.MAX_LENGTH}`
      : null;
  }
}
