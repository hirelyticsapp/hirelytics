'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { RefreshCw, User } from 'lucide-react';

import { JobInvitation } from '@/@types/job';
import { getPaginatedJobInvitations } from '@/actions/job-invite';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import JobInvitationCard from './job-invitation-card';

interface PaginatedJobInvitationsResponse {
  data: JobInvitation[];
  totalCount: number;
  pageCount: number;
}

export default function JobInvitations() {
  const pageSize = 6;

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, error, refetch } =
    useInfiniteQuery({
      queryKey: ['job-invitations-infinite'],
      queryFn: async ({ pageParam }: { pageParam: number }) => {
        const response = await getPaginatedJobInvitations(pageParam, pageSize);
        return response;
      },
      getNextPageParam: (lastPage: PaginatedJobInvitationsResponse, pages) => {
        const nextPage = pages.length;
        return lastPage.data.length === pageSize ? nextPage : undefined;
      },
      initialPageParam: 0,
    });

  const allInvitations =
    data?.pages.flatMap((page: PaginatedJobInvitationsResponse) => page.data) || [];
  const totalCount = data?.pages[0]?.totalCount || 0;

  return (
    <div className="container mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Job Invitations</h1>
          <p className="text-muted-foreground">Explore exciting opportunities from top companies</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {totalCount} Total Invitations
          </Badge>
        </div>
      </div>

      {error && (
        <div className="flex items-center justify-between p-4 border border-destructive/50 rounded-lg bg-destructive/10">
          <p className="text-sm text-destructive">
            Error loading invitations: {(error as Error).message}
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <p className="text-muted-foreground">Loading invitations...</p>
        </div>
      )}

      {allInvitations.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center p-12 border border-muted/50 rounded-lg bg-muted/10">
          <div className="p-4 rounded-full bg-muted mb-4">
            <User className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No job invitations yet</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            When recruiters discover your profile and want to connect, their invitations will appear
            here.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allInvitations.map((invitation: JobInvitation) => (
          <JobInvitationCard key={invitation.id} jobInvitation={invitation} />
        ))}
      </div>

      {/* Load More Button */}
      {hasNextPage && (
        <div className="flex justify-center pt-6">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            size="lg"
          >
            {isFetchingNextPage ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Loading more...
              </>
            ) : (
              'Load More Invitations'
            )}
          </Button>
        </div>
      )}

      {allInvitations.length > 0 && (
        <div className="text-center text-sm text-muted-foreground pt-4">
          Showing {allInvitations.length} of {totalCount} invitations
        </div>
      )}
    </div>
  );
}
