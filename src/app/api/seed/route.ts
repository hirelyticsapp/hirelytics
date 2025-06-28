import { NextRequest, NextResponse } from 'next/server';

import { connectToDatabase } from '@/db';
import Job from '@/db/schema/job';
import Organization from '@/db/schema/organization';
import User from '@/db/schema/user';

// Sample data for seeding
const sampleOrganizations = [
  {
    name: 'Hirelytics',
    slug: 'hirelytics',
    description: 'Advanced AI-powered recruitment and interview platform',
    logo: 'https://placehold.co/200x200/4f46e5/white.png?text=Hirelytics',
  },
  {
    name: 'TechCorp Solutions',
    slug: 'techcorp-solutions',
    description: 'Leading technology solutions provider',
    logo: 'https://placehold.co/200x200/059669/white.png?text=TechCorp',
  },
  {
    name: 'Digital Innovations Inc',
    slug: 'digital-innovations-inc',
    description: 'Pioneering digital transformation',
    logo: 'https://placehold.co/200x200/dc2626/white.png?text=Digital+Innovations',
  },
  {
    name: 'Global Enterprises',
    slug: 'global-enterprises',
    description: 'International business solutions',
    logo: 'https://placehold.co/200x200/ea580c/white.png?text=Global+Enterprises',
  },
  {
    name: 'StartupHub',
    slug: 'startuphub',
    description: 'Innovation-driven startup accelerator',
    logo: 'https://placehold.co/200x200/7c3aed/white.png?text=StartupHub',
  },
  {
    name: 'FinanceFirst',
    slug: 'financefirst',
    description: 'Premier financial services provider',
    logo: 'https://placehold.co/200x200/0891b2/white.png?text=FinanceFirst',
  },
];

const sampleJobs = [
  {
    title: 'Senior Full Stack Developer',
    description: 'Build scalable web applications using modern technologies.',
    industry: 'technology',
    location: 'San Francisco, CA',
    salary: '$120,000 - $160,000',
    currency: 'USD',
    skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker'],
    requirements: "Bachelor's degree in Computer Science or equivalent experience.",
    benefits: 'Health insurance, 401k matching, flexible work schedule',
    status: 'published',
    jobType: 'regular',
  },
  {
    title: 'Data Scientist',
    description: 'Analyze complex datasets to drive business insights.',
    industry: 'technology',
    location: 'New York, NY',
    salary: '$110,000 - $150,000',
    currency: 'USD',
    skills: ['Python', 'Machine Learning', 'SQL', 'TensorFlow', 'Pandas'],
    requirements: "Master's degree in Data Science, Statistics, or related field.",
    benefits: 'Comprehensive healthcare, stock options, learning stipend',
    status: 'published',
    jobType: 'regular',
  },
  {
    title: 'Product Manager',
    description: 'Drive product strategy and roadmap for our flagship platform.',
    industry: 'technology',
    location: 'Austin, TX',
    salary: '$130,000 - $170,000',
    currency: 'USD',
    skills: ['Product Management', 'Agile', 'User Research', 'Analytics', 'Roadmapping'],
    requirements: '5+ years of product management experience',
    benefits: 'Unlimited PTO, remote work options, equity package',
    status: 'published',
    jobType: 'regular',
  },
  {
    title: 'Financial Analyst',
    description: 'Analyze financial data and provide strategic recommendations.',
    industry: 'finance',
    location: 'Chicago, IL',
    salary: '$75,000 - $95,000',
    currency: 'USD',
    skills: ['Excel', 'Financial Modeling', 'SQL', 'Tableau', 'PowerBI'],
    requirements: "Bachelor's degree in Finance, Economics, or Accounting",
    benefits: 'Performance bonuses, professional development, healthcare',
    status: 'published',
    jobType: 'regular',
  },
  {
    title: 'Marketing Manager',
    description: 'Lead digital marketing campaigns and brand strategy.',
    industry: 'marketing',
    location: 'Los Angeles, CA',
    salary: '$85,000 - $110,000',
    currency: 'USD',
    skills: ['Digital Marketing', 'SEO', 'Content Strategy', 'Analytics', 'Social Media'],
    requirements: '3+ years of marketing experience',
    benefits: 'Creative environment, flexible hours, marketing conference budget',
    status: 'published',
    jobType: 'regular',
  },
];

const sampleMockJobs = [
  {
    title: 'Frontend Developer Practice Interview',
    description: 'Practice your frontend development skills with React and JavaScript questions.',
    industry: 'technology',
    location: 'Remote',
    salary: 'Practice Interview',
    currency: 'USD',
    skills: ['React', 'JavaScript', 'HTML', 'CSS', 'Git'],
    requirements: 'Basic knowledge of frontend technologies',
    benefits: 'Improve your interview skills',
    status: 'published',
    jobType: 'mock',
  },
  {
    title: 'Backend Developer Mock Interview',
    description: 'Test your backend development knowledge with Node.js and database questions.',
    industry: 'technology',
    location: 'Remote',
    salary: 'Practice Interview',
    currency: 'USD',
    skills: ['Node.js', 'Express', 'MongoDB', 'REST APIs', 'Authentication'],
    requirements: 'Understanding of backend concepts',
    benefits: 'Build confidence for real interviews',
    status: 'published',
    jobType: 'mock',
  },
  {
    title: 'Data Science Interview Practice',
    description: 'Practice data science concepts, algorithms, and Python programming.',
    industry: 'technology',
    location: 'Remote',
    salary: 'Practice Interview',
    currency: 'USD',
    skills: ['Python', 'Pandas', 'NumPy', 'Machine Learning', 'Statistics'],
    requirements: 'Basic knowledge of data science',
    benefits: 'Prepare for technical data science interviews',
    status: 'published',
    jobType: 'mock',
  },
  {
    title: 'Product Manager Simulation',
    description: 'Practice product management scenarios and case studies.',
    industry: 'technology',
    location: 'Remote',
    salary: 'Practice Interview',
    currency: 'USD',
    skills: ['Product Strategy', 'User Research', 'Analytics', 'Communication', 'Problem Solving'],
    requirements: 'Interest in product management',
    benefits: 'Learn product management interview techniques',
    status: 'published',
    jobType: 'mock',
  },
  {
    title: 'Software Engineering Behavioral Interview',
    description: 'Practice behavioral questions commonly asked in software engineering interviews.',
    industry: 'technology',
    location: 'Remote',
    salary: 'Practice Interview',
    currency: 'USD',
    skills: ['Communication', 'Teamwork', 'Problem Solving', 'Leadership', 'Adaptability'],
    requirements: 'Any level of experience',
    benefits: 'Improve interview communication skills',
    status: 'published',
    jobType: 'mock',
  },
  {
    title: 'Finance Interview Simulation',
    description: 'Practice financial analysis and modeling questions.',
    industry: 'finance',
    location: 'Remote',
    salary: 'Practice Interview',
    currency: 'USD',
    skills: ['Financial Modeling', 'Valuation', 'Excel', 'Accounting', 'Analysis'],
    requirements: 'Basic finance knowledge',
    benefits: 'Prepare for finance industry interviews',
    status: 'published',
    jobType: 'mock',
  },
];

const interviewConfig = {
  duration: 45,
  difficultyLevel: 'normal' as const,
  screenMonitoring: false,
  screenMonitoringMode: 'photo' as const,
  screenMonitoringInterval: 30 as const,
  cameraMonitoring: false,
  cameraMonitoringMode: 'photo' as const,
  cameraMonitoringInterval: 30 as const,
};

const questionsConfig = {
  mode: 'ai-mode' as const,
  totalQuestions: 8,
  categoryConfigs: [
    { type: 'technical-coding', numberOfQuestions: 3 },
    { type: 'behavioral', numberOfQuestions: 3 },
    { type: 'system-design', numberOfQuestions: 2 },
  ],
  questionTypes: ['technical-coding', 'behavioral', 'system-design'],
};

export async function POST(req: NextRequest) {
  try {
    // Check for admin secret in headers for security
    const adminSecret = req.headers.get('x-admin-secret');
    const expectedSecret = process.env.ADMIN_SECRET_KEY || 'hirelytics-seed-2025';
    if (!adminSecret || adminSecret !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const logs: string[] = [];
    logs.push('🌱 Starting database seeding...');

    await connectToDatabase();
    logs.push('✅ Connected to database');

    // Clear existing data
    logs.push('🧹 Clearing existing data...');
    await Job.deleteMany({ jobType: { $in: ['regular', 'mock'] } });
    await Organization.deleteMany({});
    await User.deleteMany({ email: 'admin@hirelytics.com' });

    // Create organizations
    logs.push('Creating organizations...');
    const organizations = [];
    for (const orgData of sampleOrganizations) {
      const org = new Organization(orgData);
      const savedOrg = await org.save();
      organizations.push(savedOrg);
      logs.push(`Created organization: ${savedOrg.name}`);
    }

    // Create admin user
    logs.push('Creating admin user...');
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@hirelytics.com',
      role: 'admin',
      emailVerified: true,
      avatar: 'https://placehold.co/150x150/4f46e5/white.png?text=Admin',
    });
    const savedUser = await adminUser.save();
    logs.push(`Created admin user: ${savedUser.email}`);

    // Create regular jobs
    logs.push('Creating regular jobs...');
    for (let i = 0; i < sampleJobs.length; i++) {
      const jobData = sampleJobs[i];
      const org = organizations[i % organizations.length];

      const job = new Job({
        ...jobData,
        organizationId: org._id,
        recruiter: savedUser._id,
        expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        interviewConfig,
        questionsConfig,
      });

      const savedJob = await job.save();
      logs.push(`Created job: ${savedJob.title}`);
    }

    // Create mock jobs
    logs.push('Creating mock interview jobs...');
    for (let i = 0; i < sampleMockJobs.length; i++) {
      const jobData = sampleMockJobs[i];
      const org = organizations[i % organizations.length];

      const mockJob = new Job({
        ...jobData,
        organizationId: org._id,
        recruiter: savedUser._id,
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        interviewConfig: {
          ...interviewConfig,
          duration: 30, // Shorter duration for practice
        },
        questionsConfig: {
          ...questionsConfig,
          totalQuestions: 5, // Fewer questions for practice
          categoryConfigs: [
            { type: 'technical-coding', numberOfQuestions: 2 },
            { type: 'behavioral', numberOfQuestions: 3 },
          ],
        },
      });

      const savedJob = await mockJob.save();
      logs.push(`Created mock interview: ${savedJob.title}`);
    }

    logs.push('🎉 Database seeding completed successfully!');
    logs.push(`Created ${organizations.length} organizations`);
    logs.push(`Created ${sampleJobs.length} regular jobs`);
    logs.push(`Created ${sampleMockJobs.length} mock interview opportunities`);

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      logs,
      summary: {
        organizations: organizations.length,
        regularJobs: sampleJobs.length,
        mockInterviews: sampleMockJobs.length,
      },
    });
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    return NextResponse.json({ error: 'Failed to seed database', details: error }, { status: 500 });
  }
}
