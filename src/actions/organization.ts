'use server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { PaginationState } from '@tanstack/react-table';
import { v4 as uuidv4 } from 'uuid';

import { TableData, TableFilters } from '@/@types/table';
import { connectToDatabase, IOrganization } from '@/db';
import Member from '@/db/schema/member';
import Organization from '@/db/schema/organization';
import { env } from '@/env';
import { auth } from '@/lib/auth/server';
import { industriesData } from '@/lib/constants/industry-data';
import { createS3Client } from '@/lib/s3-client';

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

export async function OrganizationLogoUpload(file: File): Promise<{ key: string; url: string }> {
  const s3Client = createS3Client();
  const bucketName = env.AWS_S3_BUCKET_NAME;

  // Generate a unique file name with proper extension
  const fileExtension = file.name.split('.').pop() || 'jpg';
  const fileName = `organizations/logo/${uuidv4()}.${fileExtension}`;

  const uploadParams = {
    Bucket: bucketName,
    Key: fileName,
    Body: new Uint8Array(await file.arrayBuffer()),
    ContentType: file.type,
  };

  try {
    await s3Client.send(new PutObjectCommand(uploadParams));

    // Generate the public URL for the uploaded file
    const publicUrl = `${env.AWS_ENDPOINT_URL_S3}/${bucketName}/${fileName}`;

    return {
      key: fileName,
      url: publicUrl,
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file');
  }
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

// Server action to get all organizations for forms/dropdowns
export async function getOrganizations() {
  try {
    await connectToDatabase();

    const { isRecruiter, user } = await auth();
    const filter: Record<string, unknown> = {
      deleted: { $ne: true },
    };

    if (isRecruiter) {
      const userId = user?.id;
      const member = await Member.findOne({ userId });
      filter['_id'] = member?.organizationId;
    }

    const organizations = await Organization.find(filter)
      .select('_id name')
      .sort({ name: 1 })
      .lean();

    return {
      success: true,
      data: organizations.map((org) => ({
        id: org._id.toString(),
        name: org.name,
      })),
    };
  } catch (error) {
    console.error('Failed to fetch organizations:', error);
    return {
      success: false,
      error: 'Failed to fetch organizations',
      data: [],
    };
  }
}

// Server action to get skills for a specific industry
export async function getIndustrySkills(industry: string) {
  try {
    const industryData = industriesData[industry as keyof typeof industriesData];

    if (!industryData) {
      return {
        success: false,
        error: 'Industry not found',
        data: [],
      };
    }

    return {
      success: true,
      data: industryData.skills,
    };
  } catch (error) {
    console.error('Failed to fetch skills:', error);
    return {
      success: false,
      error: 'Failed to fetch skills',
      data: [],
    };
  }
}

export async function getMyOrganizationsForRecruiters() {
  try {
    await connectToDatabase();

    const { user } = await auth();
    if (!user || !user.id || user.role !== 'recruiter') {
      return {
        success: false,
        error: 'User not authenticated',
        data: [],
      };
    }
    const userId = user?.id;

    const members = await Member.findOne({ userId });
    if (!members) {
      return {
        success: true,
        data: [],
      };
    }
    const organizationIds = members.organizationId;

    const organizations = await Organization.findById(organizationIds)
      .select('_id name slug logo description createdAt updatedAt')
      .sort({ name: 1 })
      .lean();

    return {
      success: true,
      data: {
        id: organizations?._id.toString(),
        name: organizations?.name,
        slug: organizations?.slug,
        logo: organizations?.logo,
        description: organizations?.description,
        createdAt: organizations?.createdAt,
        updatedAt: organizations?.updatedAt,
      },
    };
  } catch (error) {
    console.error('Failed to fetch organizations:', error);
    return {
      success: false,
      error: 'Failed to fetch organizations',
      data: [],
    };
  }
}
