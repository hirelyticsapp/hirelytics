'use client';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, Edit, Eye, MoreHorizontal, RefreshCw, Trash2 } from 'lucide-react';
import { X } from 'lucide-react';
import { useState } from 'react';

import { fetchOrganizations } from '@/actions/organization';
import { DataTable } from '@/components/data-table/data-table';
import S3SignedImage from '@/components/s3-signed-image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { IOrganization } from '@/db';
import { useDataTable } from '@/hooks/use-data-table';
import { useTableParams } from '@/hooks/use-table-params';

import OrganizationCreateUpdateForm from './organization-create-update-form';
import OrganizationDetails from './organization-details';
import RecruiterRemoveConfirmation from './organization-remove-confiirmation';

export default function OrganizationTable() {
  const [open, setOpen] = useState(false);
  const [organizationDeleteOpen, setOrganizationDeleteOpen] = useState(false);
  const [organizationDetailsOpen, setOrganizationDetailsOpen] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState<IOrganization | null>(null);
  const { pagination, filters, sorting, setSearch, setRole, setStatus } = useTableParams();
  const { data, totalCount, pageCount, isLoading, error, refetch } = useDataTable({
    queryKey: ['organizations', pagination, filters, sorting],
    queryFn: () => fetchOrganizations(pagination, filters, sorting),
  });

  const clearFilters = () => {
    setSearch('');
    setRole('');
    setStatus('');
  };

  const hasActiveFilters = filters.search || filters.role || filters.status;

  const columns: ColumnDef<IOrganization>[] = [
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
      accessorKey: 'slug',
      header: 'Slug',
      cell: ({ row }) => <span className="text-muted-foreground">{row.getValue('slug')}</span>,
    },
    {
      accessorKey: 'logo',
      header: 'Logo',
      cell: ({ row }) => {
        const logoUrl = row.getValue('logo') as string;

        console.log('Logo URL:', logoUrl);
        return logoUrl ? (
          <>
            <S3SignedImage
              src={logoUrl}
              alt={`${row.getValue('name')} logo`}
              className="h-8 w-8 rounded"
              width={32}
              height={32}
            />
          </>
        ) : (
          <Badge variant="secondary">No Logo</Badge>
        );
      },
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.getValue('description')}</span>
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
                setSelectedOrganization(row.original);
                setOrganizationDetailsOpen(true);
              }}
            >
              <Eye className="mr-2 h-4 w-4" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setSelectedOrganization(row.original);
                setOpen(true);
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setSelectedOrganization(row.original);
                setOrganizationDeleteOpen(true);
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
          <h1 className="text-3xl font-bold tracking-tight">Organizations Management</h1>
          <p className="text-muted-foreground">Manage your organizations</p>
        </div>
        <OrganizationCreateUpdateForm
          open={open}
          setOpen={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen) {
              setSelectedOrganization(null);
            }
          }}
          organization={selectedOrganization as IOrganization}
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex-1">
          <Input
            placeholder="Search by organization name..."
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
        {selectedOrganization && (
          <>
            <RecruiterRemoveConfirmation
              open={organizationDeleteOpen}
              setOpen={setOrganizationDeleteOpen}
              selectedOrganization={selectedOrganization}
              onConfirm={() => {
                // Handle delete confirmation
                setOrganizationDeleteOpen(false);
              }}
            />
            <OrganizationDetails
              open={organizationDetailsOpen}
              setOpen={setOrganizationDetailsOpen}
              selectedOrganization={selectedOrganization}
            />
          </>
        )}
      </div>
    </div>
  );
}
