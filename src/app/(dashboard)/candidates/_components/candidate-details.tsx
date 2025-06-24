import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { IUser } from '@/db';

export function CandidateDetails({
  open,
  setOpen,
  selectedUser,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedUser: IUser | null;
}) {
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>View Candidate Details</SheetTitle>
        </SheetHeader>
        <div className="grid flex-1 auto-rows-min gap-6 px-4">
          <div className="grid gap-3">
            <div>Name</div>
            <div id="sheet-demo-name">{selectedUser?.name}</div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
