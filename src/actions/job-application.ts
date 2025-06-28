'use server';

import { connectToDatabase } from '@/db';
import Job from '@/db/schema/job';
import JobApplication from '@/db/schema/job-application';
import JobInvitation from '@/db/schema/job-invitation';
import User from '@/db/schema/user';
import { auth } from '@/lib/auth/server';

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
    jobId,
    userId: user.id,
  });

  if (existingApplication) {
    return {
      success: true,
      message: 'Application submitted successfully!',
      applicationId: String(existingApplication._id),
      uuid: existingApplication.uuid,
    };
  }

  // Use default values from job configuration or set sensible defaults
  const sessionInstruction = {
    screenMonitoring: job.interviewConfig?.screenMonitoring || false,
    screenMonitoringMode: job.interviewConfig?.screenMonitoringMode || 'photo',
    screenMonitoringInterval: job.interviewConfig?.screenMonitoringInterval || 30,
    cameraMonitoring: job.interviewConfig?.cameraMonitoring || false,
    cameraMonitoringMode: job.interviewConfig?.cameraMonitoringMode || 'photo',
    cameraMonitoringInterval: job.interviewConfig?.cameraMonitoringInterval || 30,
  };

  const instructionsForAi = {
    instruction: job.interviewConfig?.instructions || 'Standard interview questions',
    difficultyLevel: job.interviewConfig?.difficultyLevel || 'normal',
    questionMode: job.questionsConfig?.mode || 'ai-mode',
    totalQuestions: job.questionsConfig?.totalQuestions || 10,
    categoryConfigs: job.questionsConfig?.categoryConfigs || [
      { type: 'general', numberOfQuestions: 5 },
      { type: 'technical', numberOfQuestions: 5 },
    ],
    questions: job.questionsConfig?.questions || [],
  };

  // Create job application
  const applicationUuid = crypto.randomUUID();
  const jobApplication = await JobApplication.create({
    uuid: applicationUuid,
    jobId,
    userId: user.id,
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
    filter.jobId = jobId;
  }

  if (!isRecruiter) {
    // Candidates can only see their own applications
    filter.userId = user.id;
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
