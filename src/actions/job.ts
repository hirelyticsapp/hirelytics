'use server';

import { PaginationState } from '@tanstack/react-table';

import { TableData, TableFilters } from '@/@types/table';
import { connectToDatabase, IJob } from '@/db';
import Job from '@/db/schema/job';
import Member from '@/db/schema/member';
import { auth } from '@/lib/auth/server';
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
  await connectToDatabase();

  const { isRecruiter, user } = await auth();

  pagination.pageIndex = pagination.pageIndex || 0;
  const limit = pagination.pageSize || 10;
  const skip = pagination.pageIndex * limit;

  const filter: Record<string, unknown> = {
    jobType: { $ne: 'mock' }, // Exclude mock jobs from regular job listings
  };

  if (filters.search) {
    filter['$or'] = [
      { title: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } },
    ];
  }

  if (isRecruiter) {
    const userId = user?.id;
    const member = await Member.findOne({ userId });
    filter['organizationId'] = member?.organizationId;
  }

  if (filters.status) {
    filter['status'] = filters.status;
  }

  filter['deleted'] = { $ne: true };

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

    // Populate the organization name for the response
    const populatedJob = await Job.findById(savedJob.id).populate('organizationId', 'name').lean();
    const organizationName =
      populatedJob?.organizationId &&
      typeof populatedJob.organizationId === 'object' &&
      'name' in populatedJob.organizationId
        ? (populatedJob.organizationId as { name: string }).name
        : '';

    return {
      success: true,
      data: {
        id: savedJob.id,
        title: savedJob.title,
        organizationId: savedJob.organizationId.toString(),
        organizationName,
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

export async function saveDraftJob(jobId: string) {
  try {
    await connectToDatabase();

    const updatedJob = await Job.findByIdAndUpdate(
      jobId,
      {
        $set: {
          status: 'draft',
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
    console.error('Failed to save job as draft:', error);
    return {
      success: false,
      error: 'Failed to save job as draft',
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
        organizationName: plainJob.organizationId?.name || '',
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

// AI-powered job description generation
export async function generateJobDescription(
  jobTitle: string,
  industry: string,
  skills: string[],
  location: string,
  organizationName?: string
) {
  try {
    const { callAI } = await import('@/ai');

    const organizationContext = organizationName ? ` at **${organizationName}**` : '';
    const prompt = `Generate a comprehensive job description for a **${jobTitle}** position${organizationContext} in the **${industry}** industry, located in **${location}**. The role specifically requires expertise in: ${skills.join(', ')}.

Please provide the response in the following JSON format with markdown-formatted content:
{
  "description": "A detailed job description in markdown format including role overview, key responsibilities, and how the specific skills (${skills.join(', ')}) will be used.${organizationName ? ` Make sure to mention ${organizationName} as the hiring company.` : ''} Include proper markdown formatting with headers, bullet points, and emphasis.",
  "requirements": "Required qualifications, experience, and skills in markdown format. Specifically mention the required skills: ${skills.join(', ')} and location: ${location}. Use bullet points and proper markdown formatting.",
  "benefits": "Benefits package and what makes this role attractive in markdown format.${organizationName ? ` Highlight benefits specific to working at ${organizationName}.` : ''} Include location-specific benefits for ${location}. Use bullet points and proper markdown formatting."
}

Guidelines:
- Use proper markdown formatting (##, ###, -, *, **, etc.)
- Make the content professional, engaging, and specific to ${jobTitle} in ${industry}
${organizationName ? `- Prominently feature ${organizationName} as an attractive employer` : ''}
- Prominently feature the required skills: ${skills.join(', ')}
- Include location-specific information for ${location}
- Use bullet points (-) for lists
- Use bold (**text**) for emphasis on key terms
- Include relevant industry terminology for ${industry}
- Make each section substantial and informative`;

    const result = await callAI({
      provider: 'google',
      options: {
        prompt,
        temperature: 0.7,
      },
    });

    if (result.text) {
      try {
        // Try to parse the AI response as JSON
        const cleanedResponse = result.text.replace(/```json\n?|\n?```/g, '').trim();
        const parsedData = JSON.parse(cleanedResponse);

        return {
          success: true,
          data: {
            description: parsedData.description || '',
            requirements: parsedData.requirements || '',
            benefits: parsedData.benefits || '',
          },
        };
      } catch (parseError) {
        console.error('Failed to parse AI response as JSON:', parseError);

        // Fallback: create markdown-formatted content from raw text
        const _text = result.text;
        const companyContext = organizationName ? ` at **${organizationName}**` : '';
        const companyMention = organizationName ? `${organizationName} ` : 'our ';

        const description = `## About the Role

We are seeking a talented **${jobTitle}** to join ${companyMention}dynamic team in **${location}**. This role${companyContext} offers an exciting opportunity to work with cutting-edge technologies and contribute to innovative projects in the **${industry}** industry.

### Key Responsibilities
- Lead development and implementation of solutions using **${skills.slice(0, 3).join('**, **')}**
- Collaborate with cross-functional teams to deliver high-quality products
- Apply expertise in **${skills.join('**, **')}** to solve complex problems
- Drive innovation and technical excellence in ${industry}
- Mentor team members and contribute to technical decisions`;

        const requirements = `## Required Qualifications

### Essential Skills
- **${skills.join('**\n- **')}**
- Strong background in **${industry}** industry
- Excellent communication and collaboration skills
- Problem-solving mindset and analytical thinking

### Experience Requirements
- 3+ years of professional experience in ${industry}
- Proven track record working with **${skills.slice(0, 3).join('**, **')}**
- Experience working in **${location}** or similar markets
- Strong understanding of modern development practices

### Location
- Based in or willing to relocate to **${location}**
- Familiarity with ${location} market and business environment preferred`;

        const benefits = `## What We Offer

### Compensation & Benefits
- **Competitive salary** commensurate with experience
- **Performance-based bonuses** and incentives
- Comprehensive **health, dental, and vision insurance**
- **401(k) retirement plan** with company matching

### Professional Development
- **${skills.slice(0, 2).join(' and ')} certification** opportunities
- Conference attendance and training budget
- Mentorship programs and career growth paths
- Access to latest tools and technologies

### Work Environment
- **${location}-based** modern office with state-of-the-art facilities
- **Flexible work arrangements** and remote work options
- Collaborative and inclusive team culture${organizationName ? ` at ${organizationName}` : ''}
- Opportunity to work on cutting-edge ${industry} projects${organizationName ? ` with ${organizationName}'s innovative team` : ''}`;

        return {
          success: true,
          data: { description, requirements, benefits },
        };
      }
    }

    throw new Error('No response from AI service');
  } catch (error) {
    console.error('Error generating job description:', error);

    // Enhanced fallback with markdown formatting and all input parameters
    const companyContext = organizationName ? ` at **${organizationName}**` : '';
    const companyMention = organizationName ? `${organizationName}'s ` : "our company's ";

    const description = `## About the Role

We are seeking a talented **${jobTitle}** to join our dynamic team in **${location}**. This role${companyContext} offers an exciting opportunity to work with cutting-edge technologies and contribute to ${companyMention}growth in the **${industry}** industry.

### Key Responsibilities
- Lead development and implementation of solutions using **${skills.slice(0, 3).join('**, **')}**
- Collaborate with cross-functional teams to deliver high-quality products
- Apply expertise in **${skills.join('**, **')}** to drive innovation
- Contribute to technical decisions and architectural planning
- Mentor junior team members and share knowledge

### What You'll Do
- Work with **${skills.slice(0, 2).join(' and ')}** on a daily basis
- Solve complex problems in the ${industry} domain
- Participate in code reviews and maintain high standards
- Collaborate with stakeholders across the organization`;

    const requirements = `## Required Qualifications

### Technical Skills (Required)
- **${skills.join('**\n- **')}**

### Experience Requirements  
- **3+ years** of professional experience in ${industry}
- Proven expertise with **${skills.slice(0, 3).join('**, **')}**
- Strong problem-solving and analytical skills
- Excellent communication and teamwork abilities

### Education & Certifications
- Bachelor's degree in relevant field or equivalent experience
- Industry certifications in **${skills.slice(0, 2).join(' or ')}** preferred
- Continuous learning mindset and adaptability

### Location Requirements
- Based in or willing to relocate to **${location}**
- Authorized to work in the location
- Familiarity with ${location} business environment is a plus`;

    const benefits = `## Benefits & Perks

### Compensation Package
- **Competitive salary** with performance bonuses
- **Equity participation** in company growth
- Annual salary reviews and merit increases
- **${location}** market-competitive compensation

### Health & Wellness
- **Comprehensive health insurance** (medical, dental, vision)
- **Life and disability insurance**
- Mental health support and wellness programs
- **Gym membership** or wellness stipend

### Professional Growth
- **${skills.slice(0, 2).join(' and ')} training** opportunities
- Conference attendance and learning budget
- Mentorship programs and career development
- Access to latest tools and technologies

### Work-Life Balance
- **Flexible work arrangements** and remote options
- **Generous PTO** policy and paid holidays
- **${location}** office with modern amenities
- Team building events and company culture activities${organizationName ? ` at ${organizationName}` : ''}`;

    return {
      success: true,
      data: { description, requirements, benefits },
    };
  }
}

export async function generateInterviewQuestions(
  industry: string,
  jobTitle: string,
  difficultyLevel: string,
  questionTypes: string[],
  totalQuestions: number,
  organizationName?: string
) {
  try {
    const { callAI } = await import('@/ai');

    const organizationContext = organizationName ? ` at ${organizationName}` : '';
    const prompt = `Generate ${totalQuestions} interview questions for a ${jobTitle} position${organizationContext} in the ${industry} industry with ${difficultyLevel} difficulty level.

Question types to include: ${questionTypes.join(', ')}

Please provide the response in JSON format as an array of questions:
[
  {
    "id": "unique_id",
    "type": "question_type_from_list",
    "question": "The actual interview question",
    "isAIGenerated": true
  }
]

Distribute the questions evenly across the specified types. Make sure questions are:
- Relevant to the ${jobTitle} role in ${industry}
- Appropriate for ${difficultyLevel} difficulty level
- Professional and well-structured
- Specific and actionable${organizationName ? `\n- Can reference ${organizationName} as the hiring company when appropriate` : ''}

Question type guidelines:
- technical-coding: Programming problems, algorithms, data structures
- technical-system: System design, architecture questions
- behavioral: STAR method questions about past experiences
- domain-specific: Industry-specific knowledge and scenarios
- analytical: Problem-solving, case studies, logical reasoning`;

    const result = await callAI({
      provider: 'google',
      options: {
        prompt,
        temperature: 0.8,
        maxTokens: 2000,
      },
    });

    if (result.text) {
      try {
        // Try to parse the AI response as JSON
        const cleanedResponse = result.text.replace(/```json\n?|\n?```/g, '').trim();
        const parsedQuestions = JSON.parse(cleanedResponse);

        // Validate the response structure
        if (Array.isArray(parsedQuestions)) {
          const validQuestions = parsedQuestions
            .filter((q) => q.question && q.type && questionTypes.includes(q.type))
            .map((q, index) => ({
              id: q.id || `ai_${Date.now()}_${index}`,
              type: q.type,
              question: q.question,
              isAIGenerated: true,
            }))
            .slice(0, totalQuestions);

          if (validQuestions.length > 0) {
            return {
              success: true,
              data: validQuestions,
            };
          }
        }
      } catch (parseError) {
        console.error('Failed to parse AI response as JSON:', parseError);
      }
    }

    // Fallback: generate questions if AI fails
    throw new Error('AI response parsing failed');
  } catch (error) {
    console.error('Error generating interview questions:', error);

    // Fallback to hardcoded questions
    const hardcodedQuestions = {
      'technical-coding': [
        {
          id: '1',
          type: 'technical-coding',
          question:
            'Implement a function to find the longest palindromic substring in a given string.',
          isAIGenerated: false,
        },
        {
          id: '2',
          type: 'technical-coding',
          question:
            'Design a data structure that supports insert, delete, and getRandom operations in O(1) time.',
          isAIGenerated: false,
        },
        {
          id: '3',
          type: 'technical-coding',
          question: 'Write a function to merge two sorted linked lists.',
          isAIGenerated: false,
        },
      ],
      behavioral: [
        {
          id: '4',
          type: 'behavioral',
          question:
            'Tell me about a time when you had to work with a difficult team member. How did you handle the situation?',
          isAIGenerated: false,
        },
        {
          id: '5',
          type: 'behavioral',
          question:
            'Describe a challenging project you worked on. What made it challenging and how did you overcome the obstacles?',
          isAIGenerated: false,
        },
        {
          id: '6',
          type: 'behavioral',
          question:
            'Give me an example of a time when you had to learn a new technology or skill quickly.',
          isAIGenerated: false,
        },
      ],
      'technical-system': [
        {
          id: '7',
          type: 'technical-system',
          question:
            'Design a URL shortening service like bit.ly. Consider scalability, reliability, and performance.',
          isAIGenerated: false,
        },
        {
          id: '8',
          type: 'technical-system',
          question: 'How would you design a chat system that supports millions of users?',
          isAIGenerated: false,
        },
      ],
      'domain-specific': [
        {
          id: '9',
          type: 'domain-specific',
          question: `What are the key challenges in ${industry} that technology can help solve?`,
          isAIGenerated: false,
        },
        {
          id: '10',
          type: 'domain-specific',
          question: `How would you approach ${jobTitle.toLowerCase()} responsibilities in a fast-paced environment?`,
          isAIGenerated: false,
        },
      ],
      analytical: [
        {
          id: '11',
          type: 'analytical',
          question: 'Walk me through how you would analyze and solve a complex business problem.',
          isAIGenerated: false,
        },
        {
          id: '12',
          type: 'analytical',
          question: 'How do you prioritize multiple competing tasks with limited resources?',
          isAIGenerated: false,
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
    ).populate('organizationId', 'name');

    if (!updatedJob) {
      return { success: false, error: 'Job not found' };
    }

    // Extract organization name with proper typing
    const organizationName =
      updatedJob.organizationId &&
      typeof updatedJob.organizationId === 'object' &&
      'name' in updatedJob.organizationId
        ? (updatedJob.organizationId as { name: string }).name
        : '';

    return {
      success: true,
      data: {
        id: updatedJob.id,
        title: updatedJob.title,
        organizationId: updatedJob.organizationId.toString(),
        organizationName,
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

// New function to fetch mock interviews
export async function fetchMockInterviews(
  pagination: PaginationState,
  filters: TableFilters,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sorting: any[]
): Promise<TableData<Partial<IJob>>> {
  await connectToDatabase();

  const { isAdmin } = await auth();

  if (!isAdmin) {
    throw new Error('Unauthorized: Admin access required');
  }

  pagination.pageIndex = pagination.pageIndex || 0;
  const limit = pagination.pageSize || 10;
  const skip = pagination.pageIndex * limit;

  const filter: Record<string, unknown> = {
    jobType: 'mock', // Only fetch mock jobs
    deleted: { $ne: true },
  };

  if (filters.search) {
    filter['$or'] = [
      { title: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } },
    ];
  }

  if (filters.status) {
    filter['status'] = filters.status;
  }

  const [totalCount, data] = await Promise.all([
    Job.countDocuments(filter),
    Job.find(filter)
      .skip(skip)
      .limit(limit)
      .sort(sorting.length > 0 ? { [sorting[0].id]: sorting[0].desc ? -1 : 1 } : {})
      .select('title industry expiryDate location status createdAt jobType')
      .then((jobs) =>
        jobs.map((job) => ({
          id: job.id,
          title: job.title,
          industry: job.industry,
          expiryDate: job.expiryDate,
          location: job.location,
          status: job.status,
          jobType: job.jobType,
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

// Function to fetch published mock interviews for candidates
export async function fetchPublishedMockInterviews(
  pagination: PaginationState,
  filters: TableFilters,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sorting: any[]
): Promise<TableData<Partial<IJob>>> {
  await connectToDatabase();

  pagination.pageIndex = pagination.pageIndex || 0;
  const limit = pagination.pageSize || 10;
  const skip = pagination.pageIndex * limit;

  const filter: Record<string, unknown> = {
    jobType: 'mock',
    status: 'published',
    deleted: { $ne: true },
  };

  if (filters.search) {
    filter['$or'] = [
      { title: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } },
    ];
  }

  const [totalCount, data] = await Promise.all([
    Job.countDocuments(filter),
    Job.find(filter)
      .skip(skip)
      .limit(limit)
      .sort(sorting.length > 0 ? { [sorting[0].id]: sorting[0].desc ? -1 : 1 } : {})
      .populate('organizationId', 'name')
      .select(
        'title industry expiryDate location skills description organizationId interviewConfig'
      )
      .then((jobs) =>
        jobs.map((job) => ({
          id: job.id,
          title: job.title,
          industry: job.industry,
          expiryDate: job.expiryDate,
          location: job.location,
          skills: job.skills,
          description: job.description,
          organizationName:
            typeof job.organizationId === 'object' &&
            job.organizationId &&
            'name' in job.organizationId
              ? (job.organizationId as { name: string }).name
              : 'Unknown Organization',
          interviewConfig: job.interviewConfig,
        }))
      ),
  ]);

  return {
    data,
    totalCount,
    pageCount: Math.ceil(totalCount / limit),
  };
}

// Function to create a mock interview
export async function createMockInterview(data: BasicJobDetails, recruiterId?: string) {
  try {
    await connectToDatabase();

    const { isAdmin } = await auth();

    if (!isAdmin) {
      throw new Error('Unauthorized: Admin access required');
    }

    // Create the mock interview job
    const mockJob = new Job({
      title: data.title,
      organizationId: data.organizationId,
      industry: data.industry,
      location: data.location,
      salary: data.salary,
      currency: data.currency,
      skills: data.skills,
      status: data.status || 'draft',
      jobType: 'mock', // Set as mock job
      expiryDate: data.expiryDate,
      description: '', // Will be filled in later steps
      recruiter: recruiterId || null,
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

    const savedJob = await mockJob.save();

    // Populate the organization name for the response
    const populatedJob = await Job.findById(savedJob.id).populate('organizationId', 'name').lean();
    const organizationName =
      populatedJob?.organizationId &&
      typeof populatedJob.organizationId === 'object' &&
      'name' in populatedJob.organizationId
        ? (populatedJob.organizationId as { name: string }).name
        : '';

    return {
      success: true,
      jobId: savedJob.id,
      data: {
        id: savedJob.id,
        title: savedJob.title,
        organizationId: savedJob.organizationId.toString(),
        organizationName,
        industry: savedJob.industry,
        location: savedJob.location,
        salary: savedJob.salary,
        currency: savedJob.currency,
        skills: savedJob.skills,
        status: savedJob.status,
        jobType: savedJob.jobType,
        expiryDate: savedJob.expiryDate,
        createdAt: savedJob.createdAt,
      },
    };
  } catch (error) {
    console.error('Error creating mock interview:', error);
    return { success: false, error: 'Failed to create mock interview' };
  }
}

// AI-powered interview instructions generation
export async function generateInterviewInstructions(
  jobTitle: string,
  industry: string,
  skills: string[],
  location: string,
  organizationName?: string,
  description?: string,
  requirements?: string
) {
  try {
    const { callAI } = await import('@/ai');

    const organizationContext = organizationName ? ` at **${organizationName}**` : '';
    const skillsText = skills.join(', ');
    const contextInfo = [
      description ? `Job Description: ${description.substring(0, 500)}...` : '',
      requirements ? `Requirements: ${requirements.substring(0, 300)}...` : '',
    ]
      .filter(Boolean)
      .join('\n\n');

    const prompt = `Generate comprehensive interview instructions for a **${jobTitle}** position${organizationContext} in the **${industry}** industry, located in **${location}**. 

Key Skills Required: ${skillsText}

${contextInfo ? `Additional Context:\n${contextInfo}\n` : ''}

Please provide professional interview instructions that include:

1. **Welcome Message**: A warm, professional greeting for candidates
2. **Interview Overview**: What the candidate can expect during the interview
3. **Technical Requirements**: Any technical setup or requirements
4. **Assessment Areas**: What skills and competencies will be evaluated (focus on: ${skillsText})
5. **Format and Duration**: Structure of the interview process
6. **Preparation Guidelines**: How candidates should prepare
7. **Evaluation Criteria**: What interviewers will be looking for
8. **Next Steps**: What happens after the interview

Make the instructions:
- Professional and welcoming
- Specific to ${jobTitle} role in ${industry}
- Clear and easy to understand
- Comprehensive but not overwhelming
${organizationName ? `- Reflect ${organizationName}'s professional standards` : ''}

Format the response as clear, structured text with proper headings and bullet points.`;

    const result = await callAI({
      provider: 'google',
      options: {
        prompt,
        temperature: 0.6,
        maxTokens: 1500,
      },
    });

    if (result.text) {
      return {
        success: true,
        data: {
          instructions: result.text.trim(),
        },
      };
    }

    throw new Error('No response from AI service');
  } catch (error) {
    console.error('Error generating interview instructions:', error);

    // Enhanced fallback with job-specific content
    const companyContext = organizationName ? ` at ${organizationName}` : '';
    const skillsText = skills.join(', ');

    const fallbackInstructions = `# Interview Instructions - ${jobTitle}${companyContext}

## Welcome

Welcome to the interview process for the **${jobTitle}** position${companyContext} in ${location}. We're excited to learn more about your qualifications and experience in the **${industry}** industry.

## Interview Overview

This interview is designed to assess your technical skills, problem-solving abilities, and cultural fit for our ${jobTitle} role. The session will focus on your expertise in **${skills.slice(0, 3).join(', ')}** and other relevant technologies.

## Technical Requirements

- Ensure you have a stable internet connection
- Test your camera and microphone beforehand
- Have a quiet, well-lit environment ready
- Keep a notepad and pen handy for any notes

## Assessment Areas

During this interview, we will evaluate:

- **Technical Skills**: Your proficiency in ${skillsText}
- **Problem-Solving**: How you approach complex challenges in ${industry}
- **Communication**: Your ability to explain technical concepts clearly
- **Experience**: Relevant background and accomplishments
- **Cultural Fit**: Alignment with our team values and work style

## Interview Format

- **Duration**: Approximately 45-60 minutes
- **Structure**: 
  - Introduction and background (5-10 minutes)
  - Technical discussion and questions (30-40 minutes)
  - Your questions about the role and company (10-15 minutes)

## Preparation Guidelines

To prepare for this interview:

- Review the job description and required skills: ${skillsText}
- Prepare examples of your work with ${skills.slice(0, 2).join(' and ')}
- Think about challenges you've solved in ${industry}
- Prepare thoughtful questions about the role and our team
- Review your resume and be ready to discuss your experience

## Evaluation Criteria

We will assess candidates based on:

- Technical competency in required skills
- Problem-solving approach and methodology
- Communication clarity and professionalism
- Relevant experience and achievements
- Enthusiasm for the role and industry
- Ability to work in a collaborative environment

## Next Steps

After the interview:

- We will review your performance with our team
- Feedback will be provided within 3-5 business days
- Successful candidates will be contacted for next steps
- Feel free to reach out if you have any questions

Good luck with your interview! We look forward to our conversation.`;

    return {
      success: true,
      data: {
        instructions: fallbackInstructions,
      },
    };
  }
}
