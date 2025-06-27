'use server';

import { ObjectId } from 'mongodb';

import { connectToDatabase } from '@/db';
import Job from '@/db/schema/job';
import JobInvitation from '@/db/schema/job-invitation';
import User from '@/db/schema/user';
import { auth } from '@/lib/auth/server';

export async function inviteCandidateForJob(jobId: string, emails: string[]) {
  await connectToDatabase();

  const { user: recruiter } = await auth();

  const invited = await Promise.all(
    emails.map(async (email) => {
      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({
          email,
          role: 'candidate',
        });
      }

      // Check if the user is already invited for this job
      const existingInvitation = await JobInvitation.findOne({
        jobId,
        candidateEmail: email,
      });
      if (existingInvitation) {
        //skip
        return email; // Return the email to track successful invitations
      }

      await JobInvitation.create({
        jobId,
        candidateEmail: email,
        candidateId: user._id,
        invitedBy: recruiter?._id, // Assuming the inviter is the user themselves
        status: 'pending',
        uuid: crypto.randomUUID(), // Generate a unique identifier for the invitation
      });
      return email; // Return the email to track successful invitations
    })
  );

  if (invited.length === 0) {
    throw new Error('No candidates were invited.');
  }
  return invited;
}

export async function getJobInvitationsForUser() {
  try {
    await connectToDatabase();
    const { user } = await auth();
    const userId = user?.id;

    if (!userId || user?.role !== 'user') {
      throw new Error('User not authenticated or not a candidate.');
    }

    const invitations = await JobInvitation.aggregate([
      {
        $match: {
          candidateId: new ObjectId(userId), // Ensure candidateId matches the authenticated user
        },
      },
      {
        $lookup: {
          from: 'job', // Assuming the collection name for jobs is 'jobs'
          localField: 'jobId',
          foreignField: '_id',
          as: 'jobDetails',
        },
      },
      {
        $unwind: {
          path: '$jobDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'user', // Assuming the collection name for users is 'users'
          localField: 'invitedBy',
          foreignField: '_id',
          as: 'invitedByDetails',
        },
      },
      {
        $unwind: {
          path: '$invitedByDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          jobId: 1,
          candidateEmail: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          jobDetails: {
            id: '$jobDetails._id',
            title: '$jobDetails.title',
            description: '$jobDetails.description',
            organizationId: '$jobDetails.organizationId',
          },
          invitedByDetails: {
            id: '$invitedByDetails._id',
            email: '$invitedByDetails.email',
            name: '$invitedByDetails.name',
          },
        },
      },
    ]);

    // Convert ObjectId and other complex objects to plain values
    const plainInvitations = invitations.map((invitation) => ({
      ...invitation,
      _id: invitation._id.toString(),
      jobId: invitation.jobId.toString(),
      jobDetails: invitation.jobDetails
        ? {
            ...invitation.jobDetails,
            id: invitation.jobDetails.id?.toString(),
            organizationId: invitation.jobDetails.organizationId?.toString(),
          }
        : null,
      invitedByDetails: invitation.invitedByDetails
        ? {
            ...invitation.invitedByDetails,
            id: invitation.invitedByDetails.id?.toString(),
          }
        : null,
    }));

    console.log('Fetched job invitations:', plainInvitations);

    return { invitations: plainInvitations };
  } catch (error) {
    console.error('Error fetching job invitations:', error);
    throw new Error('Failed to fetch job invitations.');
  }
}

export async function getPaginatedJobInvitations(pageIndex: number, pageSize: number) {
  try {
    await connectToDatabase();
    const { user } = await auth();
    const userId = user?.id;

    if (!userId || user?.role !== 'user') {
      throw new Error('User not authenticated or not a candidate.');
    }

    const skip = pageIndex * pageSize;

    const [totalCount, invitations] = await Promise.all([
      JobInvitation.countDocuments({ candidateId: new ObjectId(userId) }),
      JobInvitation.aggregate([
        {
          $match: {
            candidateId: new ObjectId(userId),
          },
        },
        {
          $lookup: {
            from: 'job',
            localField: 'jobId',
            foreignField: '_id',
            as: 'jobDetails',
          },
        },
        {
          $unwind: {
            path: '$jobDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'organization',
            localField: 'jobDetails.organizationId',
            foreignField: '_id',
            as: 'organizationDetails',
          },
        },
        {
          $unwind: {
            path: '$organizationDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'user',
            localField: 'invitedBy',
            foreignField: '_id',
            as: 'invitedByDetails',
          },
        },
        {
          $unwind: {
            path: '$invitedByDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: { $toString: '$_id' },
            jobId: { $toString: '$jobId' },
            candidateEmail: 1,
            status: 1,
            createdAt: 1,
            updatedAt: 1,
            jobDetails: {
              id: { $toString: '$jobDetails._id' },
              title: '$jobDetails.title',
              description: '$jobDetails.description',
              location: '$jobDetails.location',
              salary: '$jobDetails.salary',
              type: '$jobDetails.type',
              experience: '$jobDetails.experience',
              organizationId: { $toString: '$jobDetails.organizationId' },
              organizationName: '$organizationDetails.name',
            },
            invitedByDetails: {
              id: { $toString: '$invitedByDetails._id' },
              email: '$invitedByDetails.email',
              name: '$invitedByDetails.name',
              avatar: '$invitedByDetails.avatar',
            },
          },
        },
        { $skip: skip },
        { $limit: pageSize },
      ]),
    ]);

    // Convert the aggregation result to plain objects
    const plainInvitations = invitations.map((invitation) => ({
      id: invitation._id,
      jobId: invitation.jobId,
      candidateEmail: invitation.candidateEmail,
      status: invitation.status,
      createdAt: invitation.createdAt,
      updatedAt: invitation.updatedAt,
      jobDetails: invitation.jobDetails || null,
      invitedByDetails: invitation.invitedByDetails || null,
    }));

    return {
      data: plainInvitations,
      totalCount,
      pageCount: Math.ceil(totalCount / pageSize),
    };
  } catch (error) {
    console.error('Error fetching paginated job invitations:', error);
    throw new Error('Failed to fetch paginated job invitations.');
  }
}

export async function getJobDetails(jobId: string) {
  try {
    await connectToDatabase();
    const { user } = await auth();

    if (!user) {
      throw new Error('User not authenticated.');
    }

    const jobDetails = await Job.aggregate([
      {
        $match: {
          _id: new ObjectId(jobId),
        },
      },
      {
        $lookup: {
          from: 'organization',
          localField: 'organizationId',
          foreignField: '_id',
          as: 'organizationDetails',
        },
      },
      {
        $unwind: {
          path: '$organizationDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'user',
          localField: 'recruiter',
          foreignField: '_id',
          as: 'createdByDetails',
        },
      },
      {
        $unwind: {
          path: '$createdByDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: { $toString: '$_id' },
          title: 1,
          description: 1,
          requirements: 1,
          benefits: 1,
          location: 1,
          salary: 1,
          type: 1,
          experience: 1,
          department: 1,
          skills: 1,
          status: 1,
          deadline: 1,
          createdAt: 1,
          updatedAt: 1,
          organizationDetails: {
            id: { $toString: '$organizationDetails._id' },
            name: '$organizationDetails.name',
            description: '$organizationDetails.description',
            website: '$organizationDetails.website',
            industry: '$organizationDetails.industry',
            size: '$organizationDetails.size',
            logo: '$organizationDetails.logo',
          },
          createdByDetails: {
            id: { $toString: '$createdByDetails._id' },
            name: '$createdByDetails.name',
            email: '$createdByDetails.email',
          },
        },
      },
    ]);

    if (!jobDetails || jobDetails.length === 0) {
      throw new Error('Job not found.');
    }

    const job = jobDetails[0];

    // Return plain object with all ObjectIds converted to strings
    return {
      id: job._id,
      title: job.title,
      description: job.description,
      requirements: Array.isArray(job.requirements) ? job.requirements : [],
      benefits: Array.isArray(job.benefits) ? job.benefits : [],
      location: job.location,
      salary: job.salary,
      type: job.type,
      experience: job.experience,
      department: job.department,
      skills: Array.isArray(job.skills) ? job.skills : [],
      status: job.status,
      deadline: job.deadline,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      organizationDetails: job.organizationDetails || null,
      createdByDetails: job.createdByDetails || null,
    };
  } catch (error) {
    console.error('Error fetching job details:', error);
    throw new Error('Failed to fetch job details.');
  }
}

export async function acceptJobInvitation(invitationId: string) {
  try {
    await connectToDatabase();
    const { user } = await auth();

    if (!user || user.role !== 'user') {
      throw new Error('User not authenticated or not a candidate.');
    }

    const invitation = await JobInvitation.findOne({
      _id: new ObjectId(invitationId),
      candidateId: new ObjectId(user.id),
      status: 'pending',
    });

    if (!invitation) {
      throw new Error('Invitation not found or already accepted/declined.');
    }

    invitation.status = 'accepted';
    invitation.updatedAt = new Date();
    await invitation.save();

    return { message: 'Invitation accepted successfully.' };
  } catch (error) {
    console.error('Error accepting job invitation:', error);
    throw new Error('Failed to accept job invitation.');
  }
}

export async function declineJobInvitation(invitationId: string) {
  try {
    await connectToDatabase();
    const { user } = await auth();

    if (!user || user.role !== 'user') {
      throw new Error('User not authenticated or not a candidate.');
    }

    const invitation = await JobInvitation.findOne({
      _id: new ObjectId(invitationId),
      candidateId: new ObjectId(user.id),
      status: 'pending',
    });

    if (!invitation) {
      throw new Error('Invitation not found or already accepted/declined.');
    }

    invitation.status = 'declined';
    invitation.updatedAt = new Date();
    await invitation.save();

    return { message: 'Invitation declined successfully.' };
  } catch (error) {
    console.error('Error declining job invitation:', error);
    throw new Error('Failed to decline job invitation.');
  }
}
