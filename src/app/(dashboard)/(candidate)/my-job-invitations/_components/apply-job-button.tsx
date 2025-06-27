'use client';
import { useMutation } from '@tanstack/react-query';
import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { applyJobFromInvitation } from '@/actions/job-application';
import { LoadingButton } from '@/components/ui/loading-button';

export default function ApplyJobInvitationButton({
  invitationId,
  onSuccess,
}: {
  invitationId: string;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const acceptInvitationMutation = useMutation({
    mutationFn: async () => {
      if (!invitationId) {
        throw new Error('Invitation ID is required to apply for the job.');
      }
      return await applyJobFromInvitation(invitationId);
    },
    onSuccess: (result) => {
      router.push(`/interview/${result.uuid}`);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Failed to apply: ${(error as Error).message}`);
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
