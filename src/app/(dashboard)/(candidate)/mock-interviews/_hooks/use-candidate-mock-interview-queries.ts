import { useQuery } from '@tanstack/react-query';
import { PaginationState } from '@tanstack/react-table';

import { TableFilters } from '@/@types/table';
import { fetchPublishedMockInterviews } from '@/actions/job';

export function useCandidateMockInterviewsQuery(
  pagination: PaginationState,
  filters: TableFilters,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sorting: any[]
) {
  return useQuery({
    queryKey: ['candidate-mock-interviews', pagination, filters, sorting],
    queryFn: () => fetchPublishedMockInterviews(pagination, filters, sorting),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
