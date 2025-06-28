'use client';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal, RefreshCw, SettingsIcon, X } from 'lucide-react';
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
import { useTableParams } from '@/hooks/use-table-params';

import { useMockJobsQuery } from '../_hooks/use-mock-job-queries';
import { CreateMockJobPopup } from './create-mock-job-popup';

export default function MockJobTable() {
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const { pagination, filters, sorting, setSearch, setStatus } = useTableParams();
  const {
    data: mockJobsData,
    isLoading,
    error,
    refetch,
  } = useMockJobsQuery(pagination, filters, sorting);

  const data = mockJobsData?.data || [];
  const totalCount = mockJobsData?.totalCount || 0;
  const pageCount = mockJobsData?.pageCount || 0;

  const clearFilters = () => {
    setSearch('');
    setStatus('');
  };

  const hasActiveFilters = filters.search || filters.status;

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

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
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        const variant =
          status === 'published'
            ? 'default'
            : status === 'draft'
              ? 'secondary'
              : status === 'expired'
                ? 'destructive'
                : 'outline';

        return (
          <Badge variant={variant} className="capitalize">
            {status}
          </Badge>
        );
      },
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
            <DropdownMenuItem onClick={() => router.push(`/mock-jobs/${row.original.id}`)}>
              <SettingsIcon className="mr-2 h-4 w-4" />
              View/Edit
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-red-600">Error loading mock jobs</p>
          <p className="text-sm text-gray-600">{error.message}</p>
          <Button onClick={handleRefresh} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mock Jobs</h1>
          <p className="text-muted-foreground">
            Manage mock job opportunities for candidates to practice interviews
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleRefresh} variant="outline" size="sm" disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <CreateMockJobPopup />
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <Input
          placeholder="Search mock jobs..."
          value={filters.search || ''}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />

        {hasActiveFilters && (
          <Button onClick={clearFilters} variant="ghost" size="sm" className="h-8 px-2 lg:px-3">
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      <DataTable
        data={data}
        columns={columns}
        totalCount={totalCount}
        pageCount={pageCount}
        isLoading={isLoading}
      />
    </div>
  );
}
