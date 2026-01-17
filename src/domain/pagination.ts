export type PaginationResult<T> = {
  items: T[];
  total: number;
  pageSize: number;
  currentPage: number;
  lastPage: number;
  from: number;
  to: number;
  nextPage: boolean;
  previousPage: boolean;
};
