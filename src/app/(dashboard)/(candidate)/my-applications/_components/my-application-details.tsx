'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

interface JobApplicationTableData {
  id: string;
  uuid: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  preferredLanguage: string;
  candidate: {
    email: string;
    name: string;
  };
  jobDetails: {
    title: string;
    description: string;
    skills: string[];
    benefits?: string;
    requirements?: string;
  };
  jobId: unknown;
  userId: unknown;
  createdAt: Date;
  updatedAt: Date;
}

interface MyApplicationDetailsProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  application: JobApplicationTableData;
}

export function MyApplicationDetails({ open, setOpen, application }: MyApplicationDetailsProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'reviewed':
        return <Badge variant="default">Reviewed</Badge>;
      case 'accepted':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Accepted
          </Badge>
        );
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Application Details</DialogTitle>
          <DialogDescription>View your job application details</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Application Info */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Application Status</h3>
                <p className="text-sm text-muted-foreground">Application ID: {application.uuid}</p>
              </div>
              {getStatusBadge(application.status)}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Preferred Language</label>
                <p className="text-sm">{application.preferredLanguage}</p>
              </div>

              <div>
                <label className="text-sm font-medium">Current Status</label>
                <div>{getStatusBadge(application.status)}</div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Job Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Job Information</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Job Title</label>
                <p className="text-sm font-semibold">{application.jobDetails.title}</p>
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <div className="text-sm text-muted-foreground max-h-32 overflow-y-auto p-3 bg-muted/30 rounded-md">
                  {application.jobDetails.description}
                </div>
              </div>

              {application.jobDetails.skills && application.jobDetails.skills.length > 0 && (
                <div>
                  <label className="text-sm font-medium">Required Skills</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {application.jobDetails.skills.map((skill, index) => (
                      <Badge key={index} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {application.jobDetails.requirements && (
                <div>
                  <label className="text-sm font-medium">Requirements</label>
                  <div className="text-sm text-muted-foreground max-h-32 overflow-y-auto p-3 bg-muted/30 rounded-md">
                    {application.jobDetails.requirements}
                  </div>
                </div>
              )}

              {application.jobDetails.benefits && (
                <div>
                  <label className="text-sm font-medium">Benefits</label>
                  <div className="text-sm text-muted-foreground max-h-32 overflow-y-auto p-3 bg-muted/30 rounded-md">
                    {application.jobDetails.benefits}
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Application Timeline */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Application Timeline</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                <div>
                  <p className="text-sm font-medium">Application Submitted</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(application.createdAt).toLocaleDateString()} at{' '}
                    {new Date(application.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                <Badge variant="outline">Completed</Badge>
              </div>

              {application.updatedAt !== application.createdAt && (
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                  <div>
                    <p className="text-sm font-medium">Last Status Update</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(application.updatedAt).toLocaleDateString()} at{' '}
                      {new Date(application.updatedAt).toLocaleTimeString()}
                    </p>
                  </div>
                  {getStatusBadge(application.status)}
                </div>
              )}
            </div>
          </div>

          {/* Status Information */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">What happens next?</h4>
            <div className="text-sm text-blue-700">
              {application.status === 'pending' && (
                <p>
                  Your application is being reviewed by the recruiter. We&apos;ll notify you once
                  there&apos;s an update.
                </p>
              )}
              {application.status === 'reviewed' && (
                <p>
                  Your application has been reviewed. The recruiter may contact you soon for the
                  next steps.
                </p>
              )}
              {application.status === 'accepted' && (
                <p>
                  Congratulations! Your application has been accepted. The recruiter will contact
                  you with further details.
                </p>
              )}
              {application.status === 'rejected' && (
                <p>
                  Unfortunately, your application was not selected for this position. Keep applying
                  to other opportunities!
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
