'use client';

import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

import { getMyOrganizationsForRecruiters } from '@/actions/organization';
import S3SignedImage from '@/components/s3-signed-image';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { IOrganization } from '@/db';

export default function MyOrganization() {
  const { data: myOrganizationData, isLoading } = useQuery<IOrganization>({
    queryKey: ['myOrganization'],
    queryFn: async () => {
      const response = await getMyOrganizationsForRecruiters();
      return response.data as IOrganization;
    },
    // Add any other options you need
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!myOrganizationData) {
    return (
      <div className="text-center text-muted-foreground">
        {/* TODO: Add contact support link */}
        You are not part of any organization. please contact support teams for the same
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4">
      {/* Organization Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Organization Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3">
            {myOrganizationData.logo ? (
              <S3SignedImage
                src={myOrganizationData.logo}
                alt={myOrganizationData.name}
                width={48}
                height={48}
                className="h-12 w-12 rounded-lg object-cover border"
              />
            ) : (
              <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center border">
                <span className="text-lg font-medium text-muted-foreground">
                  {myOrganizationData.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{myOrganizationData.name}</h3>
              <p className="text-sm text-muted-foreground">Slug: {myOrganizationData.slug}</p>
            </div>
          </div>

          <Separator />

          {myOrganizationData.description && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Description</Label>
              <p className="mt-2 text-sm leading-relaxed bg-muted/50 p-3 rounded-md">
                {myOrganizationData.description}
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
            <Label className="text-sm font-medium text-muted-foreground">Organization Status</Label>
            <Badge variant={myOrganizationData.deleted ? 'destructive' : 'success'}>
              {myOrganizationData.deleted ? 'Deleted' : 'Active'}
            </Badge>
          </div>

          {myOrganizationData.deleted && myOrganizationData.deletedAt && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Deleted On</Label>
              <p className="mt-1 text-sm text-destructive">
                {format(new Date(myOrganizationData.deletedAt), 'PPP p')}
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
                {format(new Date(myOrganizationData.createdAt), 'PPP')}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Last Updated</Label>
              <p className="mt-1 text-sm">
                {format(new Date(myOrganizationData.updatedAt), 'PPP')}
              </p>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-muted-foreground">Organization ID</Label>
            <p className="mt-1 text-sm font-mono text-xs bg-muted/50 p-2 rounded-md break-all">
              {myOrganizationData.id}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
