'use client';

import { JobDetailsPage } from '@/app/(dashboard)/jobs/_components/job-form/job-details-page';

interface JobSetupPageProps {
  params: {
    jobId: string;
  };
}

export default function JobSetupPage({ params }: JobSetupPageProps) {
  // In a real app, you would fetch the job data here
  const mockJobData = {
    id: params.jobId,
    title: 'Senior Software Engineer',
    industry: 'technology',
    location: 'New York, NY',
    salary: '120,000 - 150,000',
    currency: 'USD',
    skills: ['React', 'TypeScript', 'Node.js'],
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  };

  return <JobDetailsPage jobId={params.jobId} initialData={mockJobData} />;
}
