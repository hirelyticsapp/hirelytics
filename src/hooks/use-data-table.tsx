'use client';

import { useQuery } from '@tanstack/react-query';

export function useDataTable({
  queryKey,
  queryFn,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  queryKey: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  queryFn: () => Promise<any>;
}) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    data: data?.data || [],
    totalCount: data?.totalCount || 0,
    pageCount: data?.pageCount || 0,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}
