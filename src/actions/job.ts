'use server';
import { PaginationState } from '@tanstack/react-table';

import { TableData, TableFilters } from '@/@types/table';
import { connectToDatabase, IJob } from '@/db';
import Job from '@/db/schema/job';
import { BasicJobDetails } from '@/lib/schemas/job-schemas';

export async function fetchJobs(
  pagination: PaginationState,
  filters: TableFilters,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sorting: any[]
): Promise<TableData<Partial<IJob>>> {
  pagination.pageIndex = pagination.pageIndex || 0;
  const limit = pagination.pageSize || 10;
  const skip = pagination.pageIndex * limit;

  const filter: Record<string, unknown> = {};

  if (filters.search) {
    filter['$or'] = [
      { title: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } },
    ];
  }

  if (filters.status) {
    filter['status'] = filters.status;
  }

  filter['deleted'] = { $ne: true };

  await connectToDatabase();

  console.log('Fetching organizations with filters:', filter);

  const [totalCount, data] = await Promise.all([
    Job.countDocuments(filter),
    Job.find(filter)
      .skip(skip)
      .limit(limit)
      .sort(sorting.length > 0 ? { [sorting[0].id]: sorting[0].desc ? -1 : 1 } : {})
      .select('title industry expiryDate location status')
      .then((jobs) =>
        jobs.map((job) => ({
          id: job.id,
          title: job.title,
          industry: job.industry,
          expiryDate: job.expiryDate,
          location: job.location,
          status: job.status,
        }))
      ),
  ]);

  return {
    data,
    totalCount,
    pageCount: Math.ceil(totalCount / limit),
  };
}

// New createJob function for BasicJobDetails
export async function createJobFromBasicDetails(data: BasicJobDetails, recruiterId?: string) {
  try {
    await connectToDatabase();

    // Create the job with basic details
    const job = new Job({
      title: data.title,
      organizationId: data.organizationId,
      industry: data.industry,
      location: data.location,
      salary: data.salary,
      currency: data.currency,
      skills: data.skills,
      status: data.status || 'draft',
      expiryDate: data.expiryDate,
      description: '', // Will be filled in later steps
      recruiter: recruiterId || null, // Set from the provided recruiter ID
      interviewConfig: {
        duration: 30,
        difficultyLevel: 'normal',
        screenMonitoring: false,
        screenMonitoringMode: 'photo',
        screenMonitoringInterval: 30,
        cameraMonitoring: false,
        cameraMonitoringMode: 'photo',
        cameraMonitoringInterval: 30,
      },
      questionsConfig: {
        mode: 'ai-mode',
        totalQuestions: 5,
        categoryConfigs: [],
        questionTypes: [],
      },
    });

    const savedJob = (await job.save()) as IJob;

    return {
      success: true,
      data: {
        id: savedJob.id,
        title: savedJob.title,
        organizationId: savedJob.organizationId.toString(),
        industry: savedJob.industry,
        location: savedJob.location,
        salary: savedJob.salary,
        currency: savedJob.currency,
        skills: savedJob.skills,
        status: savedJob.status,
        expiryDate: savedJob.expiryDate,
        createdAt: savedJob.createdAt,
      },
    };
  } catch (error) {
    console.error('Failed to create job:', error);
    return {
      success: false,
      error: 'Failed to create job',
      data: null,
    };
  }
}

export async function createJob(data: Partial<IJob>): Promise<Partial<IJob>> {
  await connectToDatabase();

  const job = new Job(data);
  await job.save();

  return {
    id: job.id,
    title: job.title,
    description: job.description,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  };
}

export async function updateJob(id: string, data: Partial<IJob>): Promise<Partial<IJob>> {
  await connectToDatabase();

  const job = await Job.findByIdAndUpdate(id, { $set: data }, { new: true });

  if (!job) {
    throw new Error('Job not found');
  }

  return {
    id: job.id,
    title: job.title,
    industry: job.industry,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  };
}

export async function deleteJob(id: string): Promise<void> {
  await connectToDatabase();

  console.log('Deleting organization with ID:', id);

  const result = await Job.findByIdAndUpdate(id, {
    $set: { deletedAt: new Date(), deleted: true },
  });

  if (!result) {
    throw new Error('Job not found');
  }
}
