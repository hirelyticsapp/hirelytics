'use server';

import { PaginationState, TableData, TableFilters } from '@/@types/table';
import { connectToDatabase, IUser, PortalAccessRequest } from '@/db';

export async function fetchPortalAccessRequest(
  pagination: PaginationState,
  filters: TableFilters,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sorting: any[]
): Promise<TableData<Partial<IUser>>> {
  pagination.pageIndex = pagination.pageIndex || 0;
  const limit = pagination.pageSize || 10;
  const skip = pagination.pageIndex * limit;

  const filter: Record<string, unknown> = {};

  if (filters.search) {
    filter['$or'] = [
      { name: { $regex: filters.search, $options: 'i' } },
      { email: { $regex: filters.search, $options: 'i' } },
    ];
  }

  if (filters.status && filters.status !== 'all') {
    filter['status'] = filters.status;
  }

  filter['deleted'] = { $ne: true };

  console.log('Fetching Portal Access Requests with filters:', filter);

  await connectToDatabase();

  const [totalCount, data] = await Promise.all([
    PortalAccessRequest.countDocuments(filter),
    PortalAccessRequest.find(filter)
      .skip(skip)
      .limit(limit)
      .sort(sorting.length > 0 ? { [sorting[0].id]: sorting[0].desc ? -1 : 1 } : {})
      .select(
        'full_name work_email job_title phone_number company_name company_size industry monthly_hires hiring_challenge status createdAt updatedAt'
      )
      .then((portal_access_requests) =>
        portal_access_requests.map((request) => ({
          id: request._id.toString(),
          full_name: request.full_name,
          work_email: request.work_email,
          job_title: request.job_title,
          phone_number: request.phone_number,
          company_name: request.company_name,
          company_size: request.company_size,
          industry: request.industry,
          status: request.status,
          monthly_hires: request.monthly_hires,
          hiring_challenge: request.hiring_challenge,
          createdAt: request.createdAt,
          updatedAt: request.updatedAt,
        }))
      ),
  ]);

  return {
    data,
    totalCount,
    pageCount: Math.ceil(totalCount / limit),
  };
}
