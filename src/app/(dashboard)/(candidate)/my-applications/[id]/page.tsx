import { notFound } from 'next/navigation';

import { getJobApplicationById } from '@/actions/job-application';

import MyApplicationDetailView from './_components/my-application-detail-view';

interface ApplicationDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function MyApplicationDetailPage({ params }: ApplicationDetailPageProps) {
  try {
    const { id } = await params;
    const application = await getJobApplicationById(id);
    return <MyApplicationDetailView application={application} />;
  } catch (error) {
    console.error('Error fetching application:', error);
    notFound();
  }
}
