import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { IUser } from '@/db';

export default function RecruiterDetails({
  open,
  setOpen,
  selectedRecruiter,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedRecruiter: IUser | null;
}) {
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>View Recruiter Details</SheetTitle>
        </SheetHeader>
        <div className="grid flex-1 auto-rows-min gap-6 px-4">
          <div className="grid gap-3">
            <div>Name</div>
            <div id="sheet-demo-name">{selectedRecruiter?.name}</div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
