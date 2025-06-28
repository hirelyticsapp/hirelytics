import { Card, CardContent, CardHeader } from '@/components/ui/card';

import { InterviewClient } from './_components/interview-client';

export default function InterviewPage() {
  const job = {
    title: 'Software Engineer',
    companyName: 'Tech Innovations Inc.',
    location: 'Remote',
    skills: ['JavaScript', 'React', 'Node.js'],
    interviewDuration: 30, // in minutes
  };
  return (
    <div className="container px-4 py-8 mx-auto relative">
      <div className="max-w-3xl mx-auto relative z-10">
        <Card className="mb-6 border-border shadow-lg">
          <CardHeader>
            <h1 className="text-3xl font-bold">{job.title} - AI Interview</h1>
            <p className="text-muted-foreground">Virtual interview for {job.companyName}</p>
          </CardHeader>
          <CardContent>
            <InterviewClient />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
