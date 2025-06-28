import { notFound } from 'next/navigation';

import { getJobApplicationById } from '@/actions/job-application';

import JobApplicationDetailView from './_components/job-application-detail-view';

interface ApplicationDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ApplicationDetailPage({ params }: ApplicationDetailPageProps) {
  try {
    const { id } = await params;
    const application = await getJobApplicationById(id);
    return <JobApplicationDetailView application={application} />;
  } catch (error) {
    console.error('Error fetching application:', error);
    notFound();
  }
}
