'use client';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal, RefreshCw, SendIcon, SettingsIcon } from 'lucide-react';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { DataTable } from '@/components/data-table/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { IJob } from '@/db';
import { useJobsQuery } from '@/hooks/use-job-queries';
import { useTableParams } from '@/hooks/use-table-params';

import InviteCandidateForm from './invite-candidate-form';
import { UnifiedJobCreatePopup } from './job-form/create-job-popup';

export default function JobTable() {
  const [candidateInviteOpen, setCandidateInviteOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Partial<IJob> | null>(null);

  const { pagination, filters, sorting, setSearch, setRole, setStatus } = useTableParams();
  const { data: jobsData, isLoading, error, refetch } = useJobsQuery(pagination, filters, sorting);

  const data = jobsData?.data || [];
  const totalCount = jobsData?.totalCount || 0;
  const pageCount = jobsData?.pageCount || 0;

  const clearFilters = () => {
    setSearch('');
    setRole('');
    setStatus('');
  };

  const hasActiveFilters = filters.search || filters.role || filters.status;

  const columns: ColumnDef<Partial<IJob>>[] = [
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-semibold"
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: 'industry',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-semibold"
        >
          Industry
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <Badge variant="secondary" className="capitalize">
          {row.getValue('industry')}
        </Badge>
      ),
    },
    {
      accessorKey: 'expiryDate',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-semibold"
        >
          Expiry Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue('expiryDate'));
        return date.toLocaleDateString();
      },
    },
    {
      accessorKey: 'location',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-semibold"
        >
          Location
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-semibold"
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <Badge variant={row.getValue('status') === 'active' ? 'success' : 'destructive'}>
          {row.getValue('status')}
        </Badge>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-semibold"
        >
          Created At
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue('createdAt'));
        return date.toLocaleDateString();
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                router.push(`/jobs/${row.original.id}`);
              }}
            >
              <SettingsIcon className="mr-2 h-4 w-4" />
              Manage and Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setSelectedJob(row.original);
                setCandidateInviteOpen(true);
              }}
            >
              <SendIcon className="mr-2 h-4 w-4" />
              Invite Candidates
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const router = useRouter();

  const handleJobCreated = (jobId: string) => {
    router.push(`/jobs/${jobId}`);
  };

  return (
    <div className="container mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Jobs Management</h1>
          <p className="text-muted-foreground">Manage your jobs</p>
        </div>
        <UnifiedJobCreatePopup onJobCreated={handleJobCreated} />
      </div>
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex-1">
          <Input
            placeholder="Search by name or email..."
            value={filters.search || ''}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {hasActiveFilters && (
          <Button variant="outline" onClick={clearFilters} size="sm">
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        )}
      </div>
      <div className="space-y-4">
        {error && (
          <div className="flex items-center justify-between p-4 border border-destructive/50 rounded-lg bg-destructive/10">
            <p className="text-sm text-destructive">Error loading data: {error.message}</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        )}
        <InviteCandidateForm
          open={candidateInviteOpen}
          setOpen={setCandidateInviteOpen}
          job={selectedJob as IJob}
        />

        <DataTable
          data={data}
          columns={columns}
          totalCount={totalCount}
          pageCount={pageCount}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
