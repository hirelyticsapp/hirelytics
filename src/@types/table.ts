export interface TableFilters {
  search?: string;
  role?: string;
  status?: string;
}

export interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

export type SortingState = {
  id: string;
  desc: boolean;
}[];

export interface TableData<T> {
  data: T[];
  totalCount: number;
  pageCount: number;
}
