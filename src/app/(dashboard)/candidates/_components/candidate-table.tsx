'use client';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, Edit, Eye, MoreHorizontal, RefreshCw, Trash2 } from 'lucide-react';
import { X } from 'lucide-react';
import { useState } from 'react';

import { fetchUsers } from '@/actions/candidate';
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
import { IUser } from '@/db';
import { useDataTable } from '@/hooks/use-data-table';
import { useTableParams } from '@/hooks/use-table-params';

import CandidateCreateUpdateForm from './candidate-create-update-form';
import { CandidateDetails } from './candidate-details';
import CandidateRemoveConfirmation from './candidate-remove-confiirmation';

export default function CandidateTable() {
  const [open, setOpen] = useState(false);
  const [candidateDeleteOpen, setCandidateDeleteOpen] = useState(false);
  const [candidateDetailsOpen, setCandidateDetailsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const { pagination, filters, sorting, setSearch, setRole, setStatus } = useTableParams();
  const { data, totalCount, pageCount, isLoading, error, refetch } = useDataTable({
    queryKey: ['users', pagination, filters, sorting],
    queryFn: () => fetchUsers(pagination, filters, sorting),
  });

  const clearFilters = () => {
    setSearch('');
    setRole('');
    setStatus('');
  };

  const hasActiveFilters = filters.search || filters.role || filters.status;

  const columns: ColumnDef<IUser>[] = [
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
      accessorKey: 'emailVerified',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-semibold"
        >
          Email Verified
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const emailVerified = row.getValue('emailVerified');
        return emailVerified ? (
          <Badge variant={'default'}>Verified</Badge>
        ) : (
          <Badge variant={'destructive'}>Not Verified</Badge>
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
            <DropdownMenuItem
              onClick={() => {
                setSelectedUser(row.original);
                setCandidateDetailsOpen(true);
              }}
            >
              <Eye className="mr-2 h-4 w-4" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setSelectedUser(row.original);
                setOpen(true);
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setSelectedUser(row.original);
                setCandidateDeleteOpen(true);
              }}
              className="text-destructive"
              disabled={false}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="container mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users Management</h1>
          <p className="text-muted-foreground">Manage your users</p>
        </div>
        <CandidateCreateUpdateForm
          open={open}
          setOpen={setOpen}
          candidate={selectedUser as IUser}
        />
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
        {selectedUser && (
          <>
            <CandidateRemoveConfirmation
              open={candidateDeleteOpen}
              setOpen={setCandidateDeleteOpen}
              selectedUser={selectedUser}
              onConfirm={() => {
                // Handle delete confirmation
                setCandidateDeleteOpen(false);
              }}
            />
            <CandidateDetails
              open={candidateDetailsOpen}
              setOpen={setCandidateDetailsOpen}
              selectedUser={selectedUser}
            />
          </>
        )}
      </div>
    </div>
  );
}
