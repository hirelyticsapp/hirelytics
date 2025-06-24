import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { IOrganization } from '@/db';

export default function OrganizationDetails({
  open,
  setOpen,
  selectedOrganization,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedOrganization: IOrganization | null;
}) {
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>View Organization Details</SheetTitle>
        </SheetHeader>
        <div className="grid flex-1 auto-rows-min gap-6 px-4">
          <code className="text-sm">{JSON.stringify(selectedOrganization, null, 2)}</code>
        </div>
      </SheetContent>
    </Sheet>
  );
}
