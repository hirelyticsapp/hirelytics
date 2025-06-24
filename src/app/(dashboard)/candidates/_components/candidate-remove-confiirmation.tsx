import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { deleteUser } from '@/actions/candidate';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LoadingButton } from '@/components/ui/loading-button';
import { IUser } from '@/db';
import { useTableParams } from '@/hooks/use-table-params';
import { getQueryClient } from '@/lib/query-client';

export default function CandidateRemoveConfirmation({
  open,
  setOpen,
  selectedUser,
  onConfirm,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedUser: IUser;
  onConfirm: () => void;
}) {
  const { pagination, filters, sorting } = useTableParams();
  const queryClient = getQueryClient();

  const deleteUserMutation = useMutation({
    mutationFn: async () => {
      return deleteUser(selectedUser.id);
    },
    onSuccess: () => {
      onConfirm();
      toast.success(`Candidate ${selectedUser.name} removed successfully.`);
      queryClient.invalidateQueries({ queryKey: ['users', pagination, filters, sorting] });
    },
    onError: (error) => {
      toast.error(`Failed to remove candidate: ${error.message}`);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove Candidate</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove {selectedUser.name}?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <LoadingButton
            variant="destructive"
            loading={deleteUserMutation.isPending}
            onClick={async () => {
              onConfirm();
              setOpen(false);
              await deleteUserMutation.mutateAsync();
            }}
          >
            Remove
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
