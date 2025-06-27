interface InterviewPageProps {
  params: Promise<{
    uuid: string;
  }>;
}

export default async function InterviewPage({ params }: InterviewPageProps) {
  const { uuid } = await params;

  return (
    <div>
      <h1>Interview Page</h1>
      <p>Interview UUID: {uuid}</p>
    </div>
  );
}
