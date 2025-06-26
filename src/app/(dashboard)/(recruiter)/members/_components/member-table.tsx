'use client';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, RefreshCw } from 'lucide-react';
import { X } from 'lucide-react';

import { fetchMembers } from '@/actions/member';
import { DataTable } from '@/components/data-table/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IUser } from '@/db';
import { useDataTable } from '@/hooks/use-data-table';
import { useTableParams } from '@/hooks/use-table-params';

export default function MemberTable() {
  const { pagination, filters, sorting, setSearch, setRole, setStatus } = useTableParams();
  const { data, totalCount, pageCount, isLoading, error, refetch } = useDataTable({
    queryKey: ['users', pagination, filters, sorting],
    queryFn: () => fetchMembers(pagination, filters, sorting),
  });

  const clearFilters = () => {
    setSearch('');
    setRole('');
    setStatus('');
  };

  const hasActiveFilters = filters.search || filters.role || filters.status;

  const columns: ColumnDef<IUser & { memberRole: string[] }>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-semibold"
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: 'email',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-semibold"
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: 'memberRole',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-semibold"
        >
          Role
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div>
          {row.original.memberRole.map((role: string, index: number) => (
            <span
              key={`role-${index}-${row.original.id}-${role}`}
              className="inline-block px-2 py-1 text-sm font-medium bg-muted rounded-md mr-2 capitalize first-letter"
            >
              {role}
            </span>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organization Members</h1>
          <p className="text-muted-foreground">Manage your organization members</p>
        </div>
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
