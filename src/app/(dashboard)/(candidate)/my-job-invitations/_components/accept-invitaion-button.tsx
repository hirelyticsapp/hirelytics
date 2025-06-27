'use client';
import { useMutation } from '@tanstack/react-query';
import { Check } from 'lucide-react';
import { toast } from 'sonner';

import { acceptJobInvitation } from '@/actions/job-invite';
import { LoadingButton } from '@/components/ui/loading-button';
import { getQueryClient } from '@/lib/query-client';

export default function AcceptInvitationButton({
  invitationId,
  jobId,
  onSuccess,
}: {
  invitationId: string;
  jobId?: string;
  onSuccess?: () => void;
}) {
  const queryClient = getQueryClient();
  const acceptInvitationMutation = useMutation({
    mutationFn: async () => {
      return await acceptJobInvitation(invitationId);
    },
    onSuccess: () => {
      toast.success('Invitation accepted successfully, apply for the job now!');
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
      toast.error(`Failed to accept invitation: ${(error as Error).message}`);
      console.error('Error accepting invitation:', error);
    },
  });

  return (
    <LoadingButton
      loading={acceptInvitationMutation.isPending}
      size="sm"
      className="flex-1"
      onClick={() => acceptInvitationMutation.mutate()}
    >
      <Check className="h-3 w-3 mr-1" />
      Accept
    </LoadingButton>
  );
}
