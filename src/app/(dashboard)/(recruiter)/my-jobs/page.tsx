import JobTable from '../../(admin)/jobs/_components/job-table';

export default async function MyJobs() {
  return (
    <div className="container mx-auto space-y-6">
      <JobTable />
    </div>
  );
}
