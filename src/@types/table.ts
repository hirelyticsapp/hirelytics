import type React from 'react';
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

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

export interface DataFetcherProps {
  children: (props: {
    data: User[];
    totalCount: number;
    pageCount: number;
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
  }) => React.ReactNode;
}
