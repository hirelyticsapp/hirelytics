'use server';
import { PaginationState } from '@tanstack/react-table';

import { TableData, TableFilters } from '@/@types/table';
import { connectToDatabase, IOrganization } from '@/db';
import Organization from '@/db/schema/organization';

export async function fetchOrganizations(
  pagination: PaginationState,
  filters: TableFilters,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sorting: any[]
): Promise<TableData<Partial<IOrganization>>> {
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

  if (filters.status) {
    filter['status'] = filters.status;
  }

  filter['deleted'] = { $ne: true };

  await connectToDatabase();

  console.log('Fetching organizations with filters:', filter);

  const [totalCount, data] = await Promise.all([
    Organization.countDocuments(filter),
    Organization.find(filter)
      .skip(skip)
      .limit(limit)
      .sort(sorting.length > 0 ? { [sorting[0].id]: sorting[0].desc ? -1 : 1 } : {})
      .select('name slug logo description createdAt updatedAt')
      .then((organizations) =>
        organizations.map((organization) => ({
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
          logo: organization.logo,
          description: organization.description,
          createdAt: organization.createdAt,
          updatedAt: organization.updatedAt,
        }))
      ),
  ]);

  return {
    data,
    totalCount,
    pageCount: Math.ceil(totalCount / limit),
  };
}

export async function createOrganization(
  data: Partial<IOrganization>
): Promise<Partial<IOrganization>> {
  await connectToDatabase();

  const organization = new Organization(data);
  await organization.save();

  return {
    id: organization.id,
    name: organization.name,
    slug: organization.slug,
    logo: organization.logo,
    description: organization.description,
    createdAt: organization.createdAt,
    updatedAt: organization.updatedAt,
  };
}

export async function updateOrganization(
  id: string,
  data: Partial<IOrganization>
): Promise<Partial<IOrganization>> {
  await connectToDatabase();

  const organization = await Organization.findByIdAndUpdate(id, { $set: data }, { new: true });

  if (!organization) {
    throw new Error('Organization not found');
  }

  return {
    id: organization.id,
    name: organization.name,
    slug: organization.slug,
    logo: organization.logo,
    description: organization.description,
    createdAt: organization.createdAt,
    updatedAt: organization.updatedAt,
  };
}

export async function deleteOrganization(id: string): Promise<void> {
  await connectToDatabase();

  console.log('Deleting organization with ID:', id);

  const result = await Organization.findByIdAndUpdate(id, {
    $set: { deletedAt: new Date(), deleted: true },
  });

  if (!result) {
    throw new Error('Organization not found');
  }
}
