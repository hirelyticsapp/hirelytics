import { useQuery } from '@tanstack/react-query';
import { PaginationState } from '@tanstack/react-table';

import { TableFilters } from '@/@types/table';
import { fetchMockInterviews } from '@/actions/job';

export function useMockJobsQuery(
  pagination: PaginationState,
  filters: TableFilters,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sorting: any[]
) {
  return useQuery({
    queryKey: ['mock-jobs', pagination, filters, sorting],
    queryFn: () => fetchMockInterviews(pagination, filters, sorting),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
