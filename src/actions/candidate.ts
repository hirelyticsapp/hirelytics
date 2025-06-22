'use server';
import { PaginationState } from '@tanstack/react-table';

import { TableData, TableFilters } from '@/@types/table';
import { connectToDatabase, IUser } from '@/db';
import User from '@/db/schema/user';

export async function fetchUsers(
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

  filter['role'] = 'user';

  if (filters.status) {
    filter['status'] = filters.status;
  }

  await connectToDatabase();

  const [totalCount, users] = await Promise.all([
    User.countDocuments(filter),
    User.find(filter)
      .skip(skip)
      .limit(limit)
      .sort(sorting.length > 0 ? { [sorting[0].id]: sorting[0].desc ? -1 : 1 } : {})
      .select('name email role createdAt updatedAt')
      .then((users) =>
        users.map((user) => ({
          id: user._id.toString(),
          name: user.name,
          role: user.role,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        }))
      ),
  ]);

  console.log('Fetched users:', users, filter);
  return {
    data: users,
    totalCount,
    pageCount: Math.ceil(totalCount / limit),
  };
}
