'use server';

import { PutObjectCommand } from '@aws-sdk/client-s3';
import { PaginationState } from '@tanstack/react-table';
import crypto from 'crypto';
import mongoose from 'mongoose';

import { JobApplicationTableData } from '@/@types/job';
import { TableData, TableFilters } from '@/@types/table';
import { connectToDatabase } from '@/db';
import Job from '@/db/schema/job';
import JobApplication from '@/db/schema/job-application';
import JobInvitation from '@/db/schema/job-invitation';
import User from '@/db/schema/user';
import { env } from '@/env';
import { auth } from '@/lib/auth/server';
import { createS3Client } from '@/lib/s3-client';

export const applyJobFromInvitation = async (invitationId: string, preferredLanguage?: string) => {
  if (!invitationId) {
    throw new Error('Invitation ID is required to apply for the job.');
  }

  await connectToDatabase();

  const { user } = await auth();
  if (!user) {
    throw new Error('You must be logged in to apply for a job.');
  }

  // Verify the invitation exists and is valid
  const invitation = await JobInvitation.findOne({
    _id: invitationId,
    candidateId: user.id,
    status: 'accepted', // Ensure the invitation is accepted
  });

  if (!invitation) {
    throw new Error('Invalid or expired invitation.');
  }

  const jobId = invitation.jobId;

  // Get job details
  const job = await Job.findById(jobId).populate('organizationId');
  if (!job) {
    throw new Error('Job not found.');
  }

  // Get candidate details
  const candidate = await User.findById(user.id);
  if (!candidate) {
    throw new Error('User not found.');
  }

  // Check if user has already applied
  const existingApplication = await JobApplication.findOne({
    jobId: new mongoose.Types.ObjectId(jobId),
    userId: new mongoose.Types.ObjectId(user.id),
  });

  if (existingApplication) {
    return {
      success: true,
      message: 'Application submitted successfully!',
      applicationId: String(existingApplication._id),
      uuid: existingApplication.uuid,
    };
  }

  // Set default session instruction values - no dependency on job collection
  const sessionInstruction = {
    screenMonitoring: false, // Default disabled
    screenMonitoringMode: 'photo' as const,
    screenMonitoringInterval: 30,
    cameraMonitoring: true, // Default enabled for security
    cameraMonitoringMode: 'photo' as const,
    cameraMonitoringInterval: 60,
    duration: 30, // Default 30 minutes (mandatory)
  };

  // Set default AI instructions - no dependency on job collection
  const instructionsForAi = {
    instruction: 'Standard interview questions',
    difficultyLevel: 'normal' as const,
    questionMode: 'ai-mode' as const,
    totalQuestions: 10,
    categoryConfigs: [
      { type: 'general', numberOfQuestions: 5 },
      { type: 'technical', numberOfQuestions: 5 },
    ],
    questions: [],
  };

  // Create job application
  const applicationUuid = crypto.randomUUID();
  const jobApplication = await JobApplication.create({
    uuid: applicationUuid,
    jobId: new mongoose.Types.ObjectId(jobId),
    userId: new mongoose.Types.ObjectId(user.id),
    preferredLanguage: preferredLanguage || 'en-US', // Use provided language or default to en-US
    status: 'pending',
    candidate: {
      email: candidate.email,
      name: candidate.name || candidate.email,
    },
    jobDetails: {
      title: job.title,
      description: job.description,
      skills: job.skills,
      benefits: job.benefits,
      requirements: job.requirements,
    },
    sessionInstruction,
    instructionsForAi,
  });

  // Update invitation status to accepted
  await JobInvitation.findByIdAndUpdate(invitation._id, {
    status: 'accepted',
  });

  return {
    success: true,
    message: 'Application submitted successfully!',
    applicationId: String(jobApplication._id),
    uuid: applicationUuid,
  };
};

export const getJobApplications = async (jobId?: string) => {
  await connectToDatabase();

  const { user, isRecruiter } = await auth();
  if (!user) {
    throw new Error('You must be logged in to view applications.');
  }

  const filter: Record<string, unknown> = {};

  if (jobId) {
    filter.jobId = new mongoose.Types.ObjectId(jobId);
  }

  if (!isRecruiter) {
    // Candidates can only see their own applications
    filter.userId = new mongoose.Types.ObjectId(user.id);
  }

  const applications = await JobApplication.find(filter).populate('jobId').sort({ createdAt: -1 });

  return applications;
};

export const updateJobApplicationStatus = async (
  applicationId: string,
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected'
) => {
  await connectToDatabase();

  const { user, isRecruiter } = await auth();
  if (!user || !isRecruiter) {
    throw new Error('Only recruiters can update application status.');
  }

  const application = await JobApplication.findByIdAndUpdate(
    applicationId,
    { status },
    { new: true }
  );

  if (!application) {
    throw new Error('Application not found.');
  }

  return {
    success: true,
    message: 'Application status updated successfully!',
    application,
  };
};

export async function fetchJobApplications(
  pagination: PaginationState,
  filters: TableFilters,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sorting: any[]
): Promise<TableData<JobApplicationTableData>> {
  pagination.pageIndex = pagination.pageIndex || 0;
  const limit = pagination.pageSize || 10;
  const skip = pagination.pageIndex * limit;

  await connectToDatabase();

  const { user, isRecruiter, isAdmin } = await auth();
  if (!user) {
    throw new Error('You must be logged in to view applications.');
  }

  const filter: Record<string, unknown> = {};

  if (filters.search) {
    filter['$or'] = [
      { 'candidate.name': { $regex: filters.search, $options: 'i' } },
      { 'candidate.email': { $regex: filters.search, $options: 'i' } },
      { 'jobDetails.title': { $regex: filters.search, $options: 'i' } },
    ];
  }

  if (filters.status) {
    filter['status'] = filters.status;
  }

  // Role-based filtering
  if (!isAdmin && !isRecruiter) {
    // Candidates can only see their own applications
    filter.userId = new mongoose.Types.ObjectId(user.id);
  } else if (isRecruiter && !isAdmin) {
    // Recruiters can only see applications for jobs in their organization
    const userWithOrg = user as unknown as { organizationId?: string };
    if (userWithOrg.organizationId) {
      // We need to find applications for jobs that belong to the recruiter's organization
      const organizationJobs = await Job.find({
        organizationId: new mongoose.Types.ObjectId(userWithOrg.organizationId),
      }).select('_id');
      const jobIds = organizationJobs.map((job) => job._id);
      filter.jobId = { $in: jobIds };
    } else {
      // If recruiter has no organization, they see no applications
      filter._id = { $in: [] };
    }
  }

  const [totalCount, applications] = await Promise.all([
    JobApplication.countDocuments(filter),
    JobApplication.find(filter)
      .populate('jobId', 'title description organizationId')
      .populate('userId', 'name email')
      .skip(skip)
      .limit(limit)
      .sort(sorting.length > 0 ? { [sorting[0].id]: sorting[0].desc ? -1 : 1 } : { createdAt: -1 })
      .lean()
      .then((applications) =>
        applications.map((app) => ({
          id: app._id.toString(),
          uuid: app.uuid,
          status: app.status,
          preferredLanguage: app.preferredLanguage,
          candidate: app.candidate,
          jobDetails: app.jobDetails,
          jobId: app.jobId ? app.jobId.toString() : null,
          userId: app.userId ? app.userId.toString() : null,
          createdAt: new Date(app.createdAt).toISOString(),
          updatedAt: new Date(app.updatedAt).toISOString(),
        }))
      ),
  ]);

  return {
    data: applications,
    totalCount,
    pageCount: Math.ceil(totalCount / limit),
  };
}

export async function getJobApplicationById(applicationId: string) {
  await connectToDatabase();

  const { user, isRecruiter, isAdmin } = await auth();
  if (!user) {
    throw new Error('You must be logged in to view application details.');
  }

  const application = await JobApplication.findById(applicationId)
    .populate({
      path: 'jobId',
      select:
        'title description skills benefits requirements organizationId location salary type experience',
      populate: {
        path: 'organizationId',
        select: 'name website description industry',
      },
    })
    .populate('userId', 'name email avatar')
    .lean()
    .exec();

  if (!application) {
    throw new Error('Application not found.');
  }

  // Role-based access control
  if (!isAdmin && !isRecruiter) {
    // Candidates can only view their own applications
    const userIdObj = application.userId as unknown as { _id: { toString(): string } };
    if (userIdObj._id.toString() !== user.id) {
      throw new Error('You can only view your own applications.');
    }
  } else if (isRecruiter && !isAdmin) {
    // Recruiters can only view applications for jobs in their organization
    const job = application.jobId as unknown as {
      organizationId?: { _id?: { toString(): string } };
    };
    const userWithOrg = user as unknown as { organizationId?: string };
    if (job?.organizationId?._id?.toString() !== userWithOrg.organizationId) {
      throw new Error('You can only view applications for your organization.');
    }
  }

  const jobId = application.jobId as unknown as {
    _id: { toString(): string };
    title: string;
    description: string;
    skills: string[];
    benefits?: string;
    requirements?: string;
    location?: string;
    salary?: string;
    type?: string;
    experience?: string;
    organizationId?: {
      _id: { toString(): string };
      name: string;
      website?: string;
      description?: string;
      industry?: string;
    };
  };

  const userId = application.userId as unknown as {
    _id: { toString(): string };
    name: string;
    email: string;
    avatar?: string;
  };

  return {
    id: application._id.toString(),
    uuid: application.uuid,
    status: application.status,
    preferredLanguage: application.preferredLanguage,
    candidate: {
      email: application.candidate.email,
      name: application.candidate.name,
    },
    jobDetails: {
      title: application.jobDetails.title,
      description: application.jobDetails.description,
      skills: application.jobDetails.skills || [],
      benefits: application.jobDetails.benefits,
      requirements: application.jobDetails.requirements,
    },
    sessionInstruction: application.sessionInstruction ? application.sessionInstruction : undefined,
    instructionsForAi: application.instructionsForAi
      ? {
          instruction: application.instructionsForAi.instruction,
          difficultyLevel: application.instructionsForAi.difficultyLevel,
          questionMode: application.instructionsForAi.questionMode,
          totalQuestions: application.instructionsForAi.totalQuestions,
          categoryConfigs:
            application.instructionsForAi.categoryConfigs?.map(
              (config: { type: string; numberOfQuestions: number; _id?: unknown }) => ({
                type: config.type,
                numberOfQuestions: config.numberOfQuestions,
              })
            ) || [],
          questions:
            application.instructionsForAi.questions?.map(
              (question: {
                id: string;
                type: string;
                question: string;
                isAIGenerated?: boolean;
                _id?: unknown;
              }) => ({
                id: question.id,
                type: question.type,
                question: question.question,
                isAIGenerated: question.isAIGenerated || false,
              })
            ) || [],
        }
      : undefined,
    monitoringImages: application.monitoringImages
      ? {
          camera:
            application.monitoringImages.camera?.map((img: { s3Key: string; timestamp: Date }) => ({
              s3Key: img.s3Key,
              timestamp: new Date(img.timestamp).toISOString(),
            })) || [],
          screen:
            application.monitoringImages.screen?.map((img: { s3Key: string; timestamp: Date }) => ({
              s3Key: img.s3Key,
              timestamp: new Date(img.timestamp).toISOString(),
            })) || [],
        }
      : undefined,
    jobInfo: application.jobId
      ? {
          id: jobId._id.toString(),
          title: jobId.title,
          description: jobId.description,
          skills: jobId.skills || [],
          benefits: jobId.benefits,
          requirements: jobId.requirements,
          location: jobId.location,
          salary: jobId.salary,
          type: jobId.type,
          experience: jobId.experience,
          organization: jobId.organizationId
            ? {
                id: jobId.organizationId._id.toString(),
                name: jobId.organizationId.name,
                website: jobId.organizationId.website,
                description: jobId.organizationId.description,
                industry: jobId.organizationId.industry,
              }
            : undefined,
        }
      : undefined,
    userInfo: application.userId
      ? {
          id: userId._id.toString(),
          name: userId.name,
          email: userId.email,
          avatar: userId.avatar,
        }
      : undefined,
    createdAt: new Date(application.createdAt).toISOString(),
    updatedAt: new Date(application.updatedAt).toISOString(),
  };
}

export async function getJobApplicationByUuid(uuid: string) {
  await connectToDatabase();

  const { user } = await auth();
  if (!user) {
    throw new Error('You must be logged in to view application details.');
  }

  const application = await JobApplication.findOne({ uuid })
    .populate({
      path: 'jobId',
      select:
        'title description skills benefits requirements organizationId location salary type experience',
      populate: {
        path: 'organizationId',
        select: 'name website description industry',
      },
    })
    .populate('userId', 'name email avatar')
    .lean()
    .exec();

  if (!application) {
    throw new Error('Interview session not found.');
  }

  // Candidates can only view their own applications for interview sessions
  const userIdObj = application.userId as unknown as { _id: { toString(): string } };
  if (userIdObj._id.toString() !== user.id) {
    throw new Error('You can only access your own interview session.');
  }

  const jobId = application.jobId as unknown as {
    _id: { toString(): string };
    title: string;
    description: string;
    skills: string[];
    benefits?: string;
    requirements?: string;
    location?: string;
    salary?: string;
    type?: string;
    experience?: string;
    organizationId?: {
      _id: { toString(): string };
      name: string;
      website?: string;
      description?: string;
      industry?: string;
    };
  };

  const userId = application.userId as unknown as {
    _id: { toString(): string };
    name: string;
    email: string;
    avatar?: string;
  };

  return {
    id: application._id.toString(),
    uuid: application.uuid,
    status: application.status,
    preferredLanguage: application.preferredLanguage,
    candidate: {
      email: application.candidate.email,
      name: application.candidate.name,
    },
    jobDetails: {
      title: application.jobDetails.title,
      description: application.jobDetails.description,
      skills: application.jobDetails.skills || [],
      benefits: application.jobDetails.benefits,
      requirements: application.jobDetails.requirements,
    },
    sessionInstruction: application.sessionInstruction || {
      screenMonitoring: false,
      screenMonitoringMode: 'photo' as const,
      screenMonitoringInterval: 30,
      cameraMonitoring: true,
      cameraMonitoringMode: 'photo' as const,
      cameraMonitoringInterval: 60,
      duration: 30,
    },
    instructionsForAi: application.instructionsForAi
      ? {
          instruction: application.instructionsForAi.instruction,
          difficultyLevel: application.instructionsForAi.difficultyLevel,
          questionMode: application.instructionsForAi.questionMode,
          totalQuestions: application.instructionsForAi.totalQuestions,
          categoryConfigs:
            application.instructionsForAi.categoryConfigs?.map(
              (config: { type: string; numberOfQuestions: number; _id?: unknown }) => ({
                type: config.type,
                numberOfQuestions: config.numberOfQuestions,
              })
            ) || [],
          questions:
            application.instructionsForAi.questions?.map(
              (question: {
                id: string;
                type: string;
                question: string;
                isAIGenerated?: boolean;
                _id?: unknown;
              }) => ({
                id: question.id,
                type: question.type,
                question: question.question,
                isAIGenerated: question.isAIGenerated || false,
              })
            ) || [],
        }
      : undefined,
    monitoringImages: application.monitoringImages
      ? {
          camera:
            application.monitoringImages.camera?.map((img: { s3Key: string; timestamp: Date }) => ({
              s3Key: img.s3Key,
              timestamp: new Date(img.timestamp).toISOString(),
            })) || [],
          screen:
            application.monitoringImages.screen?.map((img: { s3Key: string; timestamp: Date }) => ({
              s3Key: img.s3Key,
              timestamp: new Date(img.timestamp).toISOString(),
            })) || [],
        }
      : undefined,
    jobInfo: application.jobId
      ? {
          id: jobId._id.toString(),
          title: jobId.title,
          description: jobId.description,
          skills: jobId.skills || [],
          benefits: jobId.benefits,
          requirements: jobId.requirements,
          location: jobId.location,
          salary: jobId.salary,
          type: jobId.type,
          experience: jobId.experience,
          organization: jobId.organizationId
            ? {
                id: jobId.organizationId._id.toString(),
                name: jobId.organizationId.name,
                website: jobId.organizationId.website,
                description: jobId.organizationId.description,
                industry: jobId.organizationId.industry,
              }
            : undefined,
        }
      : undefined,
    userInfo: application.userId
      ? {
          id: userId._id.toString(),
          name: userId.name,
          email: userId.email,
          avatar: userId.avatar,
        }
      : undefined,
    createdAt: new Date(application.createdAt).toISOString(),
    updatedAt: new Date(application.updatedAt).toISOString(),
  };
}

export async function uploadMonitoringImage(
  applicationId: string,
  imageType: 'camera' | 'screen',
  imageData: string // Base64 encoded image data
) {
  await connectToDatabase();

  const { user } = await auth();
  if (!user) {
    throw new Error('You must be logged in to upload monitoring images.');
  }

  // Verify the application exists and belongs to the user
  const application = await JobApplication.findOne({
    _id: applicationId,
    userId: new mongoose.Types.ObjectId(user.id),
  });

  if (!application) {
    throw new Error(
      'Application not found or you do not have permission to upload images for this application.'
    );
  }

  try {
    // Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
    const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Generate unique S3 key
    const timestamp = new Date().toISOString();
    const uniqueId = crypto.randomUUID();
    const s3Key = `monitoring/${applicationId}/${imageType}/${timestamp}-${uniqueId}.jpg`;

    // Upload to S3
    const s3Client = createS3Client();
    const uploadCommand = new PutObjectCommand({
      Bucket: env.AWS_S3_BUCKET_NAME,
      Key: s3Key,
      Body: buffer,
      ContentType: 'image/jpeg',
      ContentEncoding: 'base64',
    });

    await s3Client.send(uploadCommand);

    // Update the application with the new monitoring image
    const updateField = `monitoringImages.${imageType}`;
    const imageEntry = {
      s3Key,
      timestamp: new Date(),
      type: 'image' as const,
    };

    await JobApplication.findByIdAndUpdate(
      applicationId,
      {
        $push: {
          [updateField]: imageEntry,
        },
      },
      { new: true }
    );

    return {
      success: true,
      message: `${imageType} monitoring image uploaded successfully!`,
      s3Key,
      timestamp: imageEntry.timestamp.toISOString(),
    };
  } catch (error) {
    console.error(`Error uploading ${imageType} monitoring image:`, error);
    throw new Error(`Failed to upload ${imageType} monitoring image. Please try again.`);
  }
}

export async function uploadCameraImage(applicationId: string, imageData: string) {
  return uploadMonitoringImage(applicationId, 'camera', imageData);
}

export async function uploadScreenImage(applicationId: string, imageData: string) {
  return uploadMonitoringImage(applicationId, 'screen', imageData);
}

export async function getMonitoringImages(applicationId: string) {
  await connectToDatabase();

  const { user, isRecruiter, isAdmin } = await auth();
  if (!user) {
    throw new Error('You must be logged in to view monitoring images.');
  }

  const application = await JobApplication.findById(applicationId)
    .populate('jobId', 'organizationId')
    .lean()
    .exec();

  if (!application) {
    throw new Error('Application not found.');
  }

  // Role-based access control
  if (!isAdmin && !isRecruiter) {
    // Candidates can only view their own applications
    if (application.userId.toString() !== user.id) {
      throw new Error('You can only view monitoring images for your own applications.');
    }
  } else if (isRecruiter && !isAdmin) {
    // Recruiters can only view images for applications in their organization
    const job = application.jobId as unknown as { organizationId?: { toString(): string } };
    const userWithOrg = user as unknown as { organizationId?: string };
    if (job?.organizationId?.toString() !== userWithOrg.organizationId) {
      throw new Error('You can only view monitoring images for applications in your organization.');
    }
  }

  return {
    camera: application.monitoringImages?.camera || [],
    screen: application.monitoringImages?.screen || [],
  };
}

export async function deleteMonitoringImage(
  applicationId: string,
  imageType: 'camera' | 'screen',
  s3Key: string
) {
  await connectToDatabase();

  const { user, isRecruiter, isAdmin } = await auth();
  if (!user) {
    throw new Error('You must be logged in to delete monitoring images.');
  }

  const application = await JobApplication.findById(applicationId)
    .populate('jobId', 'organizationId')
    .exec();

  if (!application) {
    throw new Error('Application not found.');
  }

  // Role-based access control - only allow deletion by recruiters/admins
  if (!isAdmin && !isRecruiter) {
    throw new Error('Only recruiters and admins can delete monitoring images.');
  } else if (isRecruiter && !isAdmin) {
    // Recruiters can only delete images for applications in their organization
    const job = application.jobId as unknown as { organizationId?: { toString(): string } };
    const userWithOrg = user as unknown as { organizationId?: string };
    if (job?.organizationId?.toString() !== userWithOrg.organizationId) {
      throw new Error(
        'You can only delete monitoring images for applications in your organization.'
      );
    }
  }

  try {
    // Remove from S3
    const s3Client = createS3Client();
    const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');
    const deleteCommand = new DeleteObjectCommand({
      Bucket: env.AWS_S3_BUCKET_NAME,
      Key: s3Key,
    });

    await s3Client.send(deleteCommand);

    // Remove from database
    const updateField = `monitoringImages.${imageType}`;
    await JobApplication.findByIdAndUpdate(
      applicationId,
      {
        $pull: {
          [updateField]: { s3Key },
        },
      },
      { new: true }
    );

    return {
      success: true,
      message: `${imageType} monitoring image deleted successfully!`,
    };
  } catch (error) {
    console.error(`Error deleting ${imageType} monitoring image:`, error);
    throw new Error(`Failed to delete ${imageType} monitoring image. Please try again.`);
  }
}

export async function uploadCameraVideo(applicationId: string, videoBlob: Blob, duration: number) {
  await connectToDatabase();

  const { user } = await auth();
  if (!user) {
    throw new Error('You must be logged in to upload monitoring videos.');
  }

  // Verify the application exists and belongs to the user
  const application = await JobApplication.findOne({
    _id: applicationId,
    userId: new mongoose.Types.ObjectId(user.id),
  });

  if (!application) {
    throw new Error(
      'Application not found or you do not have permission to upload videos for this application.'
    );
  }

  try {
    // Convert blob to buffer
    const arrayBuffer = await videoBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate unique S3 key
    const timestamp = new Date().toISOString();
    const uniqueId = crypto.randomUUID();
    const s3Key = `monitoring/${applicationId}/camera/video/${timestamp}-${uniqueId}.webm`;

    // Upload to S3
    const s3Client = createS3Client();
    const uploadCommand = new PutObjectCommand({
      Bucket: env.AWS_S3_BUCKET_NAME,
      Key: s3Key,
      Body: buffer,
      ContentType: 'video/webm',
    });

    await s3Client.send(uploadCommand);

    // Update the application with the new monitoring video
    const videoEntry = {
      s3Key,
      timestamp: new Date(),
      duration,
      type: 'video' as const,
    };

    await JobApplication.findByIdAndUpdate(
      applicationId,
      {
        $push: {
          'monitoringImages.camera': videoEntry,
        },
      },
      { new: true }
    );

    return {
      success: true,
      message: 'Camera monitoring video uploaded successfully!',
      s3Key,
      timestamp: videoEntry.timestamp.toISOString(),
      duration,
    };
  } catch (error) {
    console.error('Error uploading camera monitoring video:', error);
    throw new Error('Failed to upload camera monitoring video. Please try again.');
  }
}

export async function uploadScreenVideo(applicationId: string, videoBlob: Blob, duration: number) {
  await connectToDatabase();

  const { user } = await auth();
  if (!user) {
    throw new Error('You must be logged in to upload monitoring videos.');
  }

  // Verify the application exists and belongs to the user
  const application = await JobApplication.findOne({
    _id: applicationId,
    userId: new mongoose.Types.ObjectId(user.id),
  });

  if (!application) {
    throw new Error(
      'Application not found or you do not have permission to upload videos for this application.'
    );
  }

  try {
    // Convert blob to buffer
    const arrayBuffer = await videoBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate unique S3 key
    const timestamp = new Date().toISOString();
    const uniqueId = crypto.randomUUID();
    const s3Key = `monitoring/${applicationId}/screen/video/${timestamp}-${uniqueId}.webm`;

    // Upload to S3
    const s3Client = createS3Client();
    const uploadCommand = new PutObjectCommand({
      Bucket: env.AWS_S3_BUCKET_NAME,
      Key: s3Key,
      Body: buffer,
      ContentType: 'video/webm',
    });

    await s3Client.send(uploadCommand);

    // Update the application with the new monitoring video
    const videoEntry = {
      s3Key,
      timestamp: new Date(),
      duration,
      type: 'video' as const,
    };

    await JobApplication.findByIdAndUpdate(
      applicationId,
      {
        $push: {
          'monitoringImages.screen': videoEntry,
        },
      },
      { new: true }
    );

    return {
      success: true,
      message: 'Screen monitoring video uploaded successfully!',
      s3Key,
      timestamp: videoEntry.timestamp.toISOString(),
      duration,
    };
  } catch (error) {
    console.error('Error uploading screen monitoring video:', error);
    throw new Error('Failed to upload screen monitoring video. Please try again.');
  }
}
