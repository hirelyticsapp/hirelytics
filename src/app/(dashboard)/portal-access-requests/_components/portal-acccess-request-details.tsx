import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { IPortalRequestAccess } from '@/db';

export default function PortalAccessRequestDetails({
  open,
  setOpen,
  selectedRequest,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedRequest: IPortalRequestAccess | null;
}) {
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>View Portal Access Request Details</SheetTitle>
        </SheetHeader>
        <div className="grid flex-1 auto-rows-min gap-6 px-4">
          <pre>{JSON.stringify(selectedRequest, null, 2)}</pre>
        </div>
      </SheetContent>
    </Sheet>
  );
}
