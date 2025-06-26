import { format } from 'date-fns';

import S3SignedImage from '@/components/s3-signed-image';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
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
  if (!selectedOrganization) return null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="w-[500px] sm:max-w-[500px]">
        <SheetHeader>
          <SheetTitle>Organization Details</SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-100px)] p-4">
          <div className="space-y-6 py-4">
            {/* Organization Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Organization Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  {selectedOrganization.logo ? (
                    <S3SignedImage
                      src={selectedOrganization.logo}
                      alt={selectedOrganization.name}
                      width={48}
                      height={48}
                      className="h-12 w-12 rounded-lg object-cover border"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center border">
                      <span className="text-lg font-medium text-muted-foreground">
                        {selectedOrganization.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{selectedOrganization.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Slug: {selectedOrganization.slug}
                    </p>
                  </div>
                </div>

                <Separator />

                {selectedOrganization.description && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                    <p className="mt-2 text-sm leading-relaxed bg-muted/50 p-3 rounded-md">
                      {selectedOrganization.description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Organization Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Status Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Organization Status
                  </Label>
                  <Badge variant={selectedOrganization.deleted ? 'destructive' : 'success'}>
                    {selectedOrganization.deleted ? 'Deleted' : 'Active'}
                  </Badge>
                </div>

                {selectedOrganization.deleted && selectedOrganization.deletedAt && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Deleted On</Label>
                    <p className="mt-1 text-sm text-destructive">
                      {format(new Date(selectedOrganization.deletedAt), 'PPP p')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Timestamps */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Organization Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Created On</Label>
                    <p className="mt-1 text-sm">
                      {format(new Date(selectedOrganization.createdAt), 'PPP')}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Last Updated
                    </Label>
                    <p className="mt-1 text-sm">
                      {format(new Date(selectedOrganization.updatedAt), 'PPP')}
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Organization ID
                  </Label>
                  <p className="mt-1 text-sm font-mono text-xs bg-muted/50 p-2 rounded-md break-all">
                    {selectedOrganization.id}
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
