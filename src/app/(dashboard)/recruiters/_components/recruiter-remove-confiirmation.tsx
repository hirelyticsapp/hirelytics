import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { deleteRecruiter } from '@/actions/recruiter';
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

export default function RecruiterRemoveConfirmation({
  open,
  setOpen,
  selectedRecruiter,
  onConfirm,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedRecruiter: IUser;
  onConfirm: () => void;
}) {
  const { pagination, filters, sorting } = useTableParams();
  const queryClient = getQueryClient();

  const deleteRecruiterMutation = useMutation({
    mutationFn: async () => {
      return deleteRecruiter(selectedRecruiter.id);
    },
    onSuccess: () => {
      onConfirm();
      toast.success(`Recruiter ${selectedRecruiter.name} removed successfully.`);
      queryClient.invalidateQueries({ queryKey: ['recruiters', pagination, filters, sorting] });
    },
    onError: (error) => {
      toast.error(`Failed to remove recruiter: ${error.message}`);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove Recruiter</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove {selectedRecruiter.name}?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <LoadingButton
            variant="destructive"
            loading={deleteRecruiterMutation.isPending}
            onClick={async () => {
              onConfirm();
              setOpen(false);
              await deleteRecruiterMutation.mutateAsync();
            }}
          >
            Remove
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
