import { notFound } from 'next/navigation';

import { getJobById } from '@/actions/job';
import { JobDetailsPage } from '@/app/(dashboard)/(admin)/jobs/_components/job-form/job-details-page';

interface MockJobSetupPageProps {
  params: Promise<{
    jobId: string;
  }>;
}

export default async function MockJobSetupPage({ params }: MockJobSetupPageProps) {
  const { jobId } = await params;
  const result = await getJobById(jobId);

  if (!result.success || !result.data) {
    notFound();
  }

  const jobData = {
    ...result.data,
    organizationId: result.data.organizationId?.toString() || '',
    expiryDate: result.data.expiryDate ? new Date(result.data.expiryDate) : undefined,
  };

  return <JobDetailsPage jobId={jobId} initialData={jobData} />;
}
