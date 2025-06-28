'use client';
import { useMutation } from '@tanstack/react-query';
import { FastForwardIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { applyJobFromInvitation } from '@/actions/job-application';
import { LoadingButton } from '@/components/ui/loading-button';

import LanguageSelectionDialog from './language-selection-dialog';

export default function ApplyJobInvitationButton({
  invitationId,
  onSuccess,
}: {
  invitationId: string;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [showLanguageDialog, setShowLanguageDialog] = useState(false);

  const acceptInvitationMutation = useMutation({
    mutationFn: async (languageCode: string) => {
      if (!invitationId) {
        throw new Error('Invitation ID is required to apply for the job.');
      }
      return await applyJobFromInvitation(invitationId, languageCode);
    },
    onSuccess: (result) => {
      setShowLanguageDialog(false);
      router.push(`/interview/${result.uuid}`);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Failed to apply: ${(error as Error).message}`);
      setShowLanguageDialog(false);
    },
  });

  const handleApplyClick = () => {
    setShowLanguageDialog(true);
  };

  const handleLanguageSelect = (languageCode: string) => {
    acceptInvitationMutation.mutate(languageCode);
  };

  return (
    <>
      <LoadingButton loading={false} size="sm" className="flex-1" onClick={handleApplyClick}>
        <FastForwardIcon className="h-3 w-3 mr-1" />
        Apply
      </LoadingButton>

      <LanguageSelectionDialog
        open={showLanguageDialog}
        onOpenChange={setShowLanguageDialog}
        onLanguageSelect={handleLanguageSelect}
        isLoading={acceptInvitationMutation.isPending}
      />
    </>
  );
}
