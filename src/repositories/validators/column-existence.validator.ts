import { ObjectLiteral, Repository } from 'typeorm';

export class ColumnExistenceValidator<E extends ObjectLiteral> {
  public constructor(private readonly repository: Repository<E>) {}

  public validate(property: string): string | null {
    const isValid = this.isValidColumn(property);
    return isValid ? null : `Property "${property}" is not a valid column`;
  }

  private isValidColumn(property: string): boolean {
    const cleanProperty = this.extractPropertyName(property);
    const columnMeta =
      this.repository.metadata.findColumnWithPropertyName(cleanProperty);
    return columnMeta !== undefined;
  }

  private extractPropertyName(property: string): string {
    return property.includes('.') ? property.split('.')[1] : property;
  }

  public getColumnMetadata(property: string) {
    const cleanProperty = this.extractPropertyName(property);
    return this.repository.metadata.findColumnWithPropertyName(cleanProperty);
  }
}
