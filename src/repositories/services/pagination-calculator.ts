import { PaginationResult } from '@domain';

export class PaginationCalculator {
  private readonly MIN_PAGE = 1;
  private readonly MIN_LIMIT = 1;
  private readonly MAX_LIMIT = 1000;
  private readonly DEFAULT_LIMIT = 10;

  public calculateOffset(page: number, limit: number): number {
    const validPage = this.validatePage(page);
    const validLimit = this.validateLimit(limit);
    return (validPage - 1) * validLimit;
  }

  public applyPagination(
    page: number,
    limit: number,
  ): { page: number; limit: number; offset: number } {
    const validPage = this.validatePage(page);
    const validLimit = this.validateLimit(limit);
    const offset = this.calculateOffset(validPage, validLimit);

    return {
      page: validPage,
      limit: validLimit,
      offset,
    };
  }

  public createPaginationResult<T>(
    items: T[],
    total: number,
    page: number,
    limit: number,
  ): PaginationResult<T> {
    const validPage = this.validatePage(page);
    const validLimit = this.validateLimit(limit);
    const lastPage = this.calculateLastPage(total, validLimit);
    const from = this.calculateFrom(validPage, validLimit);
    const to = this.calculateTo(validPage, validLimit, total);

    return {
      items,
      total,
      pageSize: validLimit,
      currentPage: validPage,
      lastPage,
      from,
      to,
      nextPage: this.hasNextPage(validPage, lastPage),
      previousPage: this.hasPreviousPage(validPage),
    };
  }

  private validatePage(page: number): number {
    if (!Number.isInteger(page) || page < this.MIN_PAGE) {
      return this.MIN_PAGE;
    }
    return page;
  }

  private validateLimit(limit: number): number {
    if (!Number.isInteger(limit)) {
      return this.DEFAULT_LIMIT;
    }
    if (limit < this.MIN_LIMIT) {
      return this.MIN_LIMIT;
    }
    if (limit > this.MAX_LIMIT) {
      return this.MAX_LIMIT;
    }
    return limit;
  }

  private calculateLastPage(total: number, limit: number): number {
    if (total === 0) {
      return 1;
    }
    return Math.ceil(total / limit);
  }

  private calculateFrom(page: number, limit: number): number {
    return (page - 1) * limit + 1;
  }

  private calculateTo(page: number, limit: number, total: number): number {
    const calculated = page * limit;
    return Math.min(calculated, total);
  }

  private hasNextPage(page: number, lastPage: number): boolean {
    return page < lastPage;
  }

  private hasPreviousPage(page: number): boolean {
    return page > this.MIN_PAGE;
  }
}
