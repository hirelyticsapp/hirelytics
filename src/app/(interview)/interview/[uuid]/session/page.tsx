import { notFound } from 'next/navigation';

import { getJobApplicationByUuid } from '@/actions/job-application';

import VideoCall from './_component/video-call';

interface InterviewPageProps {
  params: Promise<{
    uuid: string;
  }>;
}

export default async function InterviewPage({ params }: InterviewPageProps) {
  try {
    const { uuid } = await params;
    const applicationData = await getJobApplicationByUuid(uuid);

    if (!applicationData) {
      notFound();
    }

    return <VideoCall applicationData={applicationData} />;
  } catch (error) {
    console.error('Error fetching interview session:', error);
    notFound();
  }
}
