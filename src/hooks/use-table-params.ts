'use client';

import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import { useMemo } from 'react';

import { PaginationState, SortingState, TableFilters } from '@/@types/table';

export function useTableParams() {
  // Pagination
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState('pageSize', parseAsInteger.withDefault(10));

  // Filters
  const [search, setSearch] = useQueryState('search', parseAsString.withDefault(''));
  const [role, setRole] = useQueryState('role', parseAsString.withDefault(''));
  const [status, setStatus] = useQueryState('status', parseAsString.withDefault(''));

  // Sorting
  const [sortBy, setSortBy] = useQueryState('sortBy', parseAsString.withDefault(''));
  const [sortOrder, setSortOrder] = useQueryState('sortOrder', parseAsString.withDefault('asc'));

  const pagination = useMemo(
    (): PaginationState => ({
      pageIndex: page - 1, // TanStack Table uses 0-based indexing
      pageSize,
    }),
    [page, pageSize]
  );

  const filters = useMemo(
    (): TableFilters => ({
      search: search || undefined,
      role: role || undefined,
      status: status || undefined,
    }),
    [search, role, status]
  );

  const sorting = useMemo(
    () => (sortBy ? [{ id: sortBy, desc: sortOrder === 'desc' }] : []),
    [sortBy, sortOrder]
  );

  return {
    pagination,
    filters,
    sorting,
    setPage: (pageIndex: number) => setPage(pageIndex + 1),
    setPageSize,
    setSearch,
    setRole,
    setStatus,
    setSorting: (updaterOrValue: SortingState | ((old: SortingState) => SortingState)) => {
      const sorting = typeof updaterOrValue === 'function' ? updaterOrValue([]) : updaterOrValue;
      if (sorting.length > 0) {
        setSortBy(sorting[0].id);
        setSortOrder(sorting[0].desc ? 'desc' : 'asc');
      } else {
        setSortBy('');
        setSortOrder('asc');
      }
    },
  };
}
