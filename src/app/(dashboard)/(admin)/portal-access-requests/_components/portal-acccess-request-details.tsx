import { format } from 'date-fns';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
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
  if (!selectedRequest) return null;

  const getStatusVariant = (status?: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'destructive';
      case 'pending':
      default:
        return 'secondary';
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="w-[600px] sm:max-w-[600px] p-2">
        <SheetHeader>
          <SheetTitle>Portal Access Request Details</SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-100px)] pr-4">
          <div className="space-y-6 py-4">
            {/* Status Badge */}
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-muted-foreground">Status</Label>
              <Badge variant={getStatusVariant(selectedRequest.status)} className="capitalize">
                {selectedRequest.status || 'pending'}
              </Badge>
            </div>

            <Separator />

            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                    <p className="mt-1 text-sm font-medium">{selectedRequest.full_name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Job Title</Label>
                    <p className="mt-1 text-sm">{selectedRequest.job_title}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Work Email</Label>
                    <p className="mt-1 text-sm break-all">{selectedRequest.work_email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Phone Number
                    </Label>
                    <p className="mt-1 text-sm">{selectedRequest.phone_number}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Company Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Company Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Company Name
                    </Label>
                    <p className="mt-1 text-sm font-medium">{selectedRequest.company_name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Company Size
                    </Label>
                    <p className="mt-1 text-sm">{selectedRequest.company_size}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Industry</Label>
                    <p className="mt-1 text-sm">{selectedRequest.industry}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Monthly Hires
                    </Label>
                    <p className="mt-1 text-sm">{selectedRequest.monthly_hires}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Hiring Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Hiring Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Hiring Challenge
                  </Label>
                  <p className="mt-2 text-sm leading-relaxed bg-muted/50 p-3 rounded-md">
                    {selectedRequest.hiring_challenge}
                  </p>
                </div>
                {selectedRequest.referral_source && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Referral Source
                    </Label>
                    <p className="mt-1 text-sm">{selectedRequest.referral_source}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Timestamps */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Request Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Submitted On
                    </Label>
                    <p className="mt-1 text-sm">
                      {format(new Date(selectedRequest.createdAt), 'PPP p')}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Last Updated
                    </Label>
                    <p className="mt-1 text-sm">
                      {format(new Date(selectedRequest.updatedAt), 'PPP p')}
                    </p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Request ID</Label>
                  <p className="mt-1 text-sm font-mono text-xs bg-muted/50 p-2 rounded-md break-all">
                    {selectedRequest.id}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
