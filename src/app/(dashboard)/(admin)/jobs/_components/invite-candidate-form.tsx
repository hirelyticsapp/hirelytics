import { SendHorizonalIcon } from 'lucide-react';

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
import { IJob } from '@/db';

export default function InviteCandidateForm({
  open,
  setOpen,
  job,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  job: IJob;
}) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Candidate</DialogTitle>
          <DialogDescription>
            Invite a candidate to apply for the job: {job?.title}
          </DialogDescription>
        </DialogHeader>

        {/* Form content goes here */}
        {/* Example: */}
        {/* <FormComponent job={job} /> */}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <LoadingButton type="submit">
            <SendHorizonalIcon className="mr-2 h-4 w-4" />
            Send Invitation
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
