'use server';
import { PaginationState } from '@tanstack/react-table';
import { Types } from 'mongoose';

import { TableData, TableFilters } from '@/@types/table';
import { connectToDatabase, IMember, IUser } from '@/db';
import Member from '@/db/schema/member';
import User from '@/db/schema/user';
import { auth } from '@/lib/auth/server';

type MemberWithUser = Partial<IUser> & {
  id: string;
  memberRole: string[];
};

export async function fetchMembers(
  pagination: PaginationState,
  filters: TableFilters,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sorting: any[]
): Promise<TableData<MemberWithUser>> {
  const limit = pagination.pageSize || 10;
  const skip = (pagination.pageIndex || 0) * limit;

  await connectToDatabase();

  const { organization } = await auth();
  const organizationId = organization?.id;

  if (!organizationId) {
    throw new Error('Organization ID not found in session');
  }

  // Sorting setup
  const sortStage: Record<string, 1 | -1> = {};
  if (sorting.length > 0) {
    const { id, desc } = sorting[0];
    sortStage[`user.${id}`] = desc ? -1 : 1;
  }

  // Filtering setup
  const matchStages: Record<string, unknown>[] = [
    { organizationId: new Types.ObjectId(organizationId) },
    { 'user.deleted': { $ne: true } },
  ];

  if (filters.search) {
    matchStages.push({
      $or: [
        { 'user.name': { $regex: filters.search, $options: 'i' } },
        { 'user.email': { $regex: filters.search, $options: 'i' } },
      ],
    });
  }

  // MongoDB aggregation pipeline
  const pipeline = [
    { $match: { organizationId: new Types.ObjectId(organizationId) } },
    {
      $lookup: {
        from: 'user',
        localField: 'userId',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' },
    { $match: { $and: matchStages } },
    {
      $facet: {
        totalCount: [{ $count: 'count' }],
        users: [
          ...(Object.keys(sortStage).length > 0 ? [{ $sort: sortStage }] : []),
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              id: '$user._id',
              name: '$user.name',
              email: '$user.email',
              role: '$user.role',
              emailVerified: '$user.emailVerified',
              createdAt: '$user.createdAt',
              updatedAt: '$user.updatedAt',
              memberRole: '$role', // from Member.role
            },
          },
        ],
      },
    },
    {
      $project: {
        totalCount: { $ifNull: [{ $arrayElemAt: ['$totalCount.count', 0] }, 0] },
        users: 1,
      },
    },
  ];

  const result = await Member.aggregate(pipeline).exec();
  const { users, totalCount } = result[0] || { users: [], totalCount: 0 };

  return {
    data: users.map((user: IUser) => {
      const { _id, ...rest } = user as Partial<IUser>;
      return {
        ...rest,
        id: _id?.toString(),
      };
    }) as MemberWithUser[],
    totalCount,
    pageCount: Math.ceil(totalCount / limit),
  };
}

export async function fetchRecruitersNotInOrganization(
  organizationId: string,
  pagination: PaginationState,
  filters: TableFilters,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sorting: any[]
): Promise<TableData<Partial<IUser>>> {
  pagination.pageIndex = pagination.pageIndex || 0;
  const limit = pagination.pageSize || 10;
  const skip = pagination.pageIndex * limit;

  await connectToDatabase();

  // Get user IDs that are already members of this organization
  const existingMembers = await Member.find({ organizationId }).select('userId').lean();
  const existingUserIds = existingMembers.map((member) => member.userId.toString());

  const filter: Record<string, unknown> = {
    role: 'recruiter',
    deleted: { $ne: true },
    _id: { $nin: existingUserIds }, // Exclude users who are already members
  };

  if (filters.search) {
    filter['$or'] = [
      { name: { $regex: filters.search, $options: 'i' } },
      { email: { $regex: filters.search, $options: 'i' } },
    ];
  }

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

export async function addMemberToOrganization(
  userId: string,
  organizationId: string,
  roles: string[]
): Promise<Partial<IMember>> {
  await connectToDatabase();

  // Check if member already exists
  const existingMember = await Member.findOne({ userId, organizationId });
  if (existingMember) {
    throw new Error('User is already a member of this organization');
  }

  // Validate roles
  const validRoles = ['owner', 'member'];
  const invalidRoles = roles.filter((role) => !validRoles.includes(role));
  if (invalidRoles.length > 0) {
    throw new Error(`Invalid roles: ${invalidRoles.join(', ')}`);
  }

  const member = new Member({
    userId,
    organizationId,
    role: roles,
  });

  await member.save();

  return {
    id: member._id.toString(),
    userId: member.userId.toString(),
    organizationId: member.organizationId.toString(),
    role: member.role,
    createdAt: member.createdAt,
    updatedAt: member.updatedAt,
  };
}

export async function updateMemberRoles(
  memberId: string,
  roles: string[]
): Promise<Partial<IMember>> {
  await connectToDatabase();

  // Validate roles
  const validRoles = ['owner', 'member'];
  const invalidRoles = roles.filter((role) => !validRoles.includes(role));
  if (invalidRoles.length > 0) {
    throw new Error(`Invalid roles: ${invalidRoles.join(', ')}`);
  }

  const member = await Member.findByIdAndUpdate(memberId, { $set: { role: roles } }, { new: true });

  if (!member) {
    throw new Error('Member not found');
  }

  return {
    id: member._id.toString(),
    userId: member.userId.toString(),
    organizationId: member.organizationId.toString(),
    role: member.role,
    createdAt: member.createdAt,
    updatedAt: member.updatedAt,
  };
}

export async function removeMemberFromOrganization(memberId: string): Promise<void> {
  await connectToDatabase();

  const result = await Member.findByIdAndDelete(memberId);

  if (!result) {
    throw new Error('Member not found');
  }
}

export async function fetchOrganizationMembers(
  organizationId: string,
  pagination: PaginationState
): Promise<TableData<Partial<IMember & { user: Partial<IUser> }>>> {
  pagination.pageIndex = pagination.pageIndex || 0;
  const limit = pagination.pageSize || 10;
  const skip = pagination.pageIndex * limit;

  await connectToDatabase();
  const filter: Record<string, unknown> = {
    organizationId,
  };

  const [totalCount, members] = await Promise.all([
    Member.countDocuments(filter),
    Member.find(filter)
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email role emailVerified')
      .lean(),
  ]);

  const data = members.map((member) => ({
    id: member._id.toString(),
    organizationId: member.organizationId.toString(),
    role: member.role,
    createdAt: member.createdAt,
    updatedAt: member.updatedAt,
    user:
      member.userId && typeof member.userId === 'object'
        ? {
            id: (member.userId as IUser)._id.toString(),
            name: (member.userId as IUser).name,
            email: (member.userId as IUser).email,
            role: (member.userId as IUser).role,
            emailVerified: (member.userId as IUser).emailVerified,
          }
        : undefined,
  }));

  return {
    data,
    totalCount,
    pageCount: Math.ceil(totalCount / limit),
  };
}
