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
  filter['deleted'] = { $ne: true };

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
      .select('name email role emailVerified createdAt updatedAt')
      .then((users) =>
        users.map((user) => ({
          id: user._id.toString(),
          name: user.name,
          role: user.role,
          email: user.email,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        }))
      ),
  ]);

  return {
    data: users,
    totalCount,
    pageCount: Math.ceil(totalCount / limit),
  };
}

export async function createUser(data: Partial<IUser>): Promise<Partial<IUser>> {
  await connectToDatabase();

  const user = new User(data);
  await user.save();

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function updateUser(id: string, data: Partial<IUser>): Promise<Partial<IUser>> {
  await connectToDatabase();

  const user = await User.findByIdAndUpdate(id, { $set: data }, { new: true });

  if (!user) {
    throw new Error('User not found');
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function deleteUser(id: string): Promise<void> {
  await connectToDatabase();

  const result = await User.findByIdAndUpdate(id, {
    deletedAt: new Date(),
    deleted: true,
  });

  if (!result) {
    throw new Error('User not found');
  }
}
