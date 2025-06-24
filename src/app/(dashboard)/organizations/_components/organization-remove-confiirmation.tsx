import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { deleteOrganization } from '@/actions/organization';
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
import { IOrganization } from '@/db';
import { useTableParams } from '@/hooks/use-table-params';
import { getQueryClient } from '@/lib/query-client';

export default function OrganizationRemoveConfirmation({
  open,
  setOpen,
  selectedOrganization,
  onConfirm,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedOrganization: IOrganization;
  onConfirm: () => void;
}) {
  const { pagination, filters, sorting } = useTableParams();
  const queryClient = getQueryClient();

  const deleteOrganizationMutation = useMutation({
    mutationFn: async () => {
      return deleteOrganization(selectedOrganization.id);
    },
    onSuccess: () => {
      onConfirm();
      toast.success(`Organization ${selectedOrganization.name} removed successfully.`);
      queryClient.invalidateQueries({ queryKey: ['organizations', pagination, filters, sorting] });
    },
    onError: (error) => {
      toast.error(`Failed to remove organization: ${error.message}`);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove Organization</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove {selectedOrganization.name}?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <LoadingButton
            variant="destructive"
            loading={deleteOrganizationMutation.isPending}
            onClick={async () => {
              onConfirm();
              setOpen(false);
              await deleteOrganizationMutation.mutateAsync();
            }}
          >
            Remove
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
