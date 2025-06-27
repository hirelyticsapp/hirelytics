'use client';
import { useMutation } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { toast } from 'sonner';

import { declineJobInvitation } from '@/actions/job-invite';
import { LoadingButton } from '@/components/ui/loading-button';
import { getQueryClient } from '@/lib/query-client';

export default function DeclineInvitationButton({
  invitationId,
  jobId,
  onSuccess,
}: {
  invitationId: string;
  jobId?: string;
  onSuccess?: () => void;
}) {
  const queryClient = getQueryClient();
  const declineInvitationMutation = useMutation({
    mutationFn: async () => {
      return await declineJobInvitation(invitationId);
    },
    onSuccess: () => {
      toast.success('Invitation declined successfully');
      // Invalidate job details query if jobId is provided
      if (jobId) {
        queryClient.invalidateQueries({
          queryKey: ['job-details', jobId],
        });
      }
      // Invalidate the job invitations list
      queryClient.invalidateQueries({
        queryKey: ['job-invitations-infinite'],
      });
      // Call onSuccess callback if provided
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Failed to decline invitation: ${(error as Error).message}`);
      console.error('Error declining invitation:', error);
    },
  });

  return (
    <LoadingButton
      loading={declineInvitationMutation.isPending}
      size="sm"
      variant={'destructive'}
      className="flex-1"
      onClick={() => declineInvitationMutation.mutate()}
    >
      <X className="h-3 w-3 mr-1" />
      Decline
    </LoadingButton>
  );
}
