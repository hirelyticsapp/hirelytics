'use server';

import { PaginationState } from '@tanstack/react-table';

import { TableData, TableFilters } from '@/@types/table';
import { connectToDatabase, IJob } from '@/db';
import Job from '@/db/schema/job';
import {
  BasicJobDetails,
  InterviewConfig,
  JobDescription,
  QuestionsConfig,
} from '@/lib/schemas/job-schemas';

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
      .select('title industry expiryDate location status createdAt')
      .then((jobs) =>
        jobs.map((job) => ({
          id: job.id,
          title: job.title,
          industry: job.industry,
          expiryDate: job.expiryDate,
          location: job.location,
          status: job.status,
          createdAt: job.createdAt,
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

// New server actions for updating job steps
export async function updateJobDescription(jobId: string, data: JobDescription) {
  try {
    await connectToDatabase();

    // Sanitize the data to prevent circular references
    const sanitizedData = {
      description: String(data.description || ''),
      requirements: data.requirements ? String(data.requirements) : undefined,
      benefits: data.benefits ? String(data.benefits) : undefined,
    };

    const updatedJob = await Job.findByIdAndUpdate(
      jobId,
      {
        $set: {
          ...sanitizedData,
          updatedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!updatedJob) {
      return { success: false, error: 'Job not found' };
    }

    return {
      success: true,
      data: {
        id: updatedJob.id,
        description: updatedJob.description,
        requirements: updatedJob.requirements,
        benefits: updatedJob.benefits,
      },
    };
  } catch (error) {
    console.error('Failed to update job description:', error);
    return {
      success: false,
      error: 'Failed to update job description',
    };
  }
}

export async function updateJobInterviewConfig(jobId: string, data: InterviewConfig) {
  try {
    await connectToDatabase();

    // Sanitize the data to prevent circular references and ensure clean object
    const sanitizedData = {
      duration: Number(data.duration),
      instructions: data.instructions || '',
      difficultyLevel: data.difficultyLevel,
      screenMonitoring: Boolean(data.screenMonitoring),
      screenMonitoringMode: data.screenMonitoringMode,
      screenMonitoringInterval: Number(data.screenMonitoringInterval),
      cameraMonitoring: Boolean(data.cameraMonitoring),
      cameraMonitoringMode: data.cameraMonitoringMode,
      cameraMonitoringInterval: Number(data.cameraMonitoringInterval),
    };

    console.log('Updating interview config with data:', sanitizedData);

    const updatedJob = await Job.findByIdAndUpdate(
      jobId,
      {
        $set: {
          interviewConfig: sanitizedData,
          updatedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!updatedJob) {
      return { success: false, error: 'Job not found' };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Failed to update interview config:', error);
    return {
      success: false,
      error: 'Failed to update interview config',
    };
  }
}

export async function updateJobQuestionsConfig(jobId: string, data: QuestionsConfig) {
  try {
    await connectToDatabase();

    // Sanitize the data to prevent circular references
    const sanitizedData = {
      mode: data.mode,
      totalQuestions: Number(data.totalQuestions),
      categoryConfigs: Array.isArray(data.categoryConfigs)
        ? data.categoryConfigs.map((config) => ({
            type: String(config.type),
            numberOfQuestions: Number(config.numberOfQuestions),
          }))
        : [],
      questionTypes: Array.isArray(data.questionTypes)
        ? data.questionTypes.map((type) => String(type))
        : [],
      questions: Array.isArray(data.questions)
        ? data.questions.map((question) => ({
            id: String(question.id),
            type: String(question.type),
            question: String(question.question),
            isAIGenerated: Boolean(question.isAIGenerated),
          }))
        : undefined,
    };

    const updatedJob = await Job.findByIdAndUpdate(
      jobId,
      {
        $set: {
          questionsConfig: sanitizedData,
          updatedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!updatedJob) {
      return { success: false, error: 'Job not found' };
    }

    return {
      success: true,
      data: {
        id: updatedJob.id,
        questionsConfig: updatedJob.questionsConfig,
      },
    };
  } catch (error) {
    console.error('Failed to update questions config:', error);
    return {
      success: false,
      error: 'Failed to update questions config',
    };
  }
}

export async function publishJob(jobId: string) {
  try {
    await connectToDatabase();

    const updatedJob = await Job.findByIdAndUpdate(
      jobId,
      {
        $set: {
          status: 'published',
          updatedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!updatedJob) {
      return { success: false, error: 'Job not found' };
    }

    return {
      success: true,
      data: {
        id: updatedJob.id,
        status: updatedJob.status,
      },
    };
  } catch (error) {
    console.error('Failed to publish job:', error);
    return {
      success: false,
      error: 'Failed to publish job',
    };
  }
}

export async function getJobById(jobId: string) {
  try {
    await connectToDatabase();

    const job = await Job.findById(jobId).populate('organizationId', 'name industry').lean();

    if (!job) {
      return { success: false, error: 'Job not found' };
    }

    // Safely serialize the data by converting everything to plain objects
    const plainJob = JSON.parse(JSON.stringify(job));

    return {
      success: true,
      data: {
        id: plainJob._id.toString(),
        title: plainJob.title,
        description: plainJob.description,
        requirements: plainJob.requirements,
        benefits: plainJob.benefits,
        organizationId:
          plainJob.organizationId?._id?.toString() || plainJob.organizationId?.toString(),
        industry: plainJob.industry,
        location: plainJob.location,
        salary: plainJob.salary,
        currency: plainJob.currency,
        skills: plainJob.skills || [],
        status: plainJob.status,
        expiryDate: plainJob.expiryDate,
        interviewConfig: plainJob.interviewConfig || null,
        questionsConfig: plainJob.questionsConfig || null,
        createdAt: plainJob.createdAt,
        updatedAt: plainJob.updatedAt,
      },
    };
  } catch (error) {
    console.error('Failed to get job:', error);
    return {
      success: false,
      error: 'Failed to get job',
    };
  }
}

// Hardcoded AI content generation functions (placeholder for real AI)
export async function generateJobDescription(
  jobTitle: string,
  industry: string,
  skills: string[],
  location: string
) {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const hardcodedDescriptions = {
    'Software Engineer': `We are seeking a talented Software Engineer to join our dynamic team. You will be responsible for designing, developing, and maintaining software applications that meet our business requirements.

Key Responsibilities:
• Design and develop scalable software solutions
• Collaborate with cross-functional teams to define and implement new features
• Write clean, maintainable, and efficient code
• Participate in code reviews and maintain coding standards
• Debug and resolve technical issues
• Stay updated with latest technology trends`,

    'Product Manager': `We are looking for an experienced Product Manager to drive product strategy and execution. You will work closely with engineering, design, and business teams to deliver innovative products.

Key Responsibilities:
• Define product vision and strategy
• Manage product roadmap and prioritization
• Conduct market research and competitive analysis
• Work with engineering teams on product development
• Analyze product performance and user feedback
• Collaborate with stakeholders across the organization`,

    'Data Scientist': `Join our data science team to extract insights from complex datasets and build predictive models that drive business decisions.

Key Responsibilities:
• Analyze large datasets to identify trends and patterns
• Build machine learning models and algorithms
• Create data visualizations and reports
• Collaborate with business teams to understand requirements
• Deploy models to production environments
• Stay current with data science best practices`,
  };

  const defaultDescription = `We are seeking a qualified professional to join our team in the ${industry} industry. This role offers an exciting opportunity to work with cutting-edge technologies and contribute to our company's growth.

Key Responsibilities:
• Execute core responsibilities related to ${jobTitle} role
• Collaborate with team members and stakeholders
• Contribute to project planning and execution
• Maintain high standards of quality and performance
• Participate in continuous learning and development
• Support company objectives and values`;

  const description =
    hardcodedDescriptions[jobTitle as keyof typeof hardcodedDescriptions] || defaultDescription;

  const requirements = `• Bachelor's degree in relevant field or equivalent experience
• ${Math.floor(Math.random() * 5) + 2}+ years of experience in ${industry}
• Strong knowledge of ${skills.slice(0, 3).join(', ')}
• Excellent communication and teamwork skills
• Problem-solving mindset and attention to detail
• Experience with modern development practices`;

  const benefits = `• Competitive salary and performance bonuses
• Comprehensive health, dental, and vision insurance
• 401(k) retirement plan with company matching
• Flexible work arrangements and remote work options
• Professional development opportunities
• Generous PTO policy
• Modern office environment in ${location}
• Team building activities and company events`;

  return {
    success: true,
    data: {
      description,
      requirements,
      benefits,
    },
  };
}

export async function generateInterviewQuestions(
  industry: string,
  jobTitle: string,
  difficultyLevel: string,
  questionTypes: string[],
  totalQuestions: number
) {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const hardcodedQuestions = {
    'technical-coding': [
      {
        id: '1',
        type: 'technical-coding',
        question:
          'Implement a function to find the longest palindromic substring in a given string.',
        isAIGenerated: true,
      },
      {
        id: '2',
        type: 'technical-coding',
        question:
          'Design a data structure that supports insert, delete, and getRandom operations in O(1) time.',
        isAIGenerated: true,
      },
      {
        id: '3',
        type: 'technical-coding',
        question: 'Write a function to merge two sorted linked lists.',
        isAIGenerated: true,
      },
    ],
    behavioral: [
      {
        id: '4',
        type: 'behavioral',
        question:
          'Tell me about a time when you had to work with a difficult team member. How did you handle the situation?',
        isAIGenerated: true,
      },
      {
        id: '5',
        type: 'behavioral',
        question:
          'Describe a challenging project you worked on. What made it challenging and how did you overcome the obstacles?',
        isAIGenerated: true,
      },
      {
        id: '6',
        type: 'behavioral',
        question:
          'Give me an example of a time when you had to learn a new technology or skill quickly.',
        isAIGenerated: true,
      },
    ],
    'system-design': [
      {
        id: '7',
        type: 'system-design',
        question:
          'Design a URL shortening service like bit.ly. Consider scalability, reliability, and performance.',
        isAIGenerated: true,
      },
      {
        id: '8',
        type: 'system-design',
        question: 'How would you design a chat system that supports millions of users?',
        isAIGenerated: true,
      },
    ],
    'domain-specific': [
      {
        id: '9',
        type: 'domain-specific',
        question: `What are the key challenges in ${industry} that technology can help solve?`,
        isAIGenerated: true,
      },
      {
        id: '10',
        type: 'domain-specific',
        question: `How would you approach ${jobTitle.toLowerCase()} responsibilities in a fast-paced environment?`,
        isAIGenerated: true,
      },
    ],
  };

  const allQuestions: Array<{
    id: string;
    type: string;
    question: string;
    isAIGenerated?: boolean;
  }> = [];

  questionTypes.forEach((type) => {
    if (hardcodedQuestions[type as keyof typeof hardcodedQuestions]) {
      allQuestions.push(...hardcodedQuestions[type as keyof typeof hardcodedQuestions]);
    }
  });

  // Shuffle and take required number of questions
  const shuffled = allQuestions.sort(() => 0.5 - Math.random());
  const selectedQuestions = shuffled.slice(0, totalQuestions);

  return {
    success: true,
    data: selectedQuestions,
  };
}

// New server action for updating job basic details
export async function updateJobBasicDetails(jobId: string, data: BasicJobDetails) {
  try {
    await connectToDatabase();

    // Sanitize the data to prevent circular references
    const sanitizedData = {
      title: String(data.title),
      organizationId: String(data.organizationId),
      industry: String(data.industry),
      location: String(data.location),
      salary: data.salary ? String(data.salary) : undefined,
      currency: data.currency ? String(data.currency) : undefined,
      skills: Array.isArray(data.skills) ? data.skills.map((skill) => String(skill)) : [],
      status: data.status,
      expiryDate: data.expiryDate instanceof Date ? data.expiryDate : new Date(data.expiryDate),
    };

    const updatedJob = await Job.findByIdAndUpdate(
      jobId,
      {
        $set: {
          ...sanitizedData,
          updatedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!updatedJob) {
      return { success: false, error: 'Job not found' };
    }

    return {
      success: true,
      data: {
        id: updatedJob.id,
        title: updatedJob.title,
        organizationId: updatedJob.organizationId.toString(),
        industry: updatedJob.industry,
        location: updatedJob.location,
        salary: updatedJob.salary,
        currency: updatedJob.currency,
        skills: updatedJob.skills,
        status: updatedJob.status,
        expiryDate: updatedJob.expiryDate,
      },
    };
  } catch (error) {
    console.error('Failed to update job basic details:', error);
    return {
      success: false,
      error: 'Failed to update job basic details',
    };
  }
}
