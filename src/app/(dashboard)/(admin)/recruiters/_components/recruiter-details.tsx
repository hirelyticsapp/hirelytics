import { format } from 'date-fns';
import Image from 'next/image';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
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
  if (!selectedRecruiter) return null;

  const getRoleVariant = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'recruiter':
        return 'default';
      case 'user':
      default:
        return 'secondary';
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="w-[500px] sm:max-w-[500px]">
        <SheetHeader>
          <SheetTitle>Recruiter Details</SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-100px)] p-4">
          <div className="space-y-6 py-4">
            {/* Profile Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  {selectedRecruiter?.image ? (
                    <Image
                      src={selectedRecruiter?.image}
                      alt={selectedRecruiter?.name as string}
                      width={48}
                      height={48}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-lg font-medium text-muted-foreground">
                        {selectedRecruiter?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold">{selectedRecruiter?.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedRecruiter?.email}</p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Role</Label>
                    <div className="mt-1">
                      <Badge
                        variant={getRoleVariant(selectedRecruiter?.role)}
                        className="capitalize"
                      >
                        {selectedRecruiter?.role}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Email Verified
                    </Label>
                    <div className="mt-1">
                      <Badge variant={selectedRecruiter?.emailVerified ? 'success' : 'destructive'}>
                        {selectedRecruiter?.emailVerified ? 'Verified' : 'Not Verified'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Member Since
                    </Label>
                    <p className="mt-1 text-sm">
                      {format(new Date(selectedRecruiter?.createdAt), 'PPP')}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Last Updated
                    </Label>
                    <p className="mt-1 text-sm">
                      {format(new Date(selectedRecruiter?.updatedAt), 'PPP')}
                    </p>
                  </div>
                </div>

                {selectedRecruiter?.lastLoginAt && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Last Login</Label>
                    <p className="mt-1 text-sm">
                      {format(new Date(selectedRecruiter?.lastLoginAt), 'PPP p')}
                    </p>
                  </div>
                )}

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">User ID</Label>
                  <p className="mt-1 text-sm font-mono text-xs bg-muted/50 p-2 rounded-md break-all">
                    {selectedRecruiter?.id}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Account Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Account Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Account Status
                  </Label>
                  <Badge variant={selectedRecruiter?.deleted ? 'destructive' : 'success'}>
                    {selectedRecruiter?.deleted ? 'Deleted' : 'Active'}
                  </Badge>
                </div>

                {selectedRecruiter?.deleted && selectedRecruiter?.deletedAt && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Deleted On</Label>
                    <p className="mt-1 text-sm text-destructive">
                      {format(new Date(selectedRecruiter?.deletedAt), 'PPP p')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
