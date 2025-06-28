import MockInterviewList from './_components/mock-interview-list';

export default function CandidateMockInterviewsPage() {
  return (
    <div className="container mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Mock Interviews</h1>
        <p className="text-muted-foreground">
          Practice your interview skills with our curated mock interview opportunities
        </p>
      </div>
      <MockInterviewList />
    </div>
  );
}
