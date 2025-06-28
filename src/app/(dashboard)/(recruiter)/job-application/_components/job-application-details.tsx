'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { updateJobApplicationStatus } from '@/actions/job-application';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

interface JobApplicationDetailsProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  application: JobApplicationTableData;
}

export function JobApplicationDetails({ open, setOpen, application }: JobApplicationDetailsProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(application.status);

  const handleStatusUpdate = async (
    newStatus: 'pending' | 'reviewed' | 'accepted' | 'rejected'
  ) => {
    if (newStatus === currentStatus) return;

    setIsUpdating(true);
    try {
      await updateJobApplicationStatus(application.id, newStatus);
      setCurrentStatus(newStatus);
      toast.success('Application status updated successfully');
    } catch (error) {
      toast.error('Failed to update application status');
      console.error('Error updating status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

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
          <DialogDescription>View and manage the job application details</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Application Info */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Application Status</h3>
                <p className="text-sm text-muted-foreground">UUID: {application.uuid}</p>
              </div>
              {getStatusBadge(currentStatus)}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Update Status</label>
                <Select
                  value={currentStatus}
                  onValueChange={handleStatusUpdate}
                  disabled={isUpdating}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Preferred Language</label>
                <p className="text-sm">{application.preferredLanguage}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Candidate Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Candidate Information</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <p className="text-sm">{application.candidate.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <p className="text-sm">{application.candidate.email}</p>
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
                <p className="text-sm">{application.jobDetails.title}</p>
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <p className="text-sm text-muted-foreground max-h-20 overflow-y-auto">
                  {application.jobDetails.description}
                </p>
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
                  <p className="text-sm text-muted-foreground max-h-20 overflow-y-auto">
                    {application.jobDetails.requirements}
                  </p>
                </div>
              )}

              {application.jobDetails.benefits && (
                <div>
                  <label className="text-sm font-medium">Benefits</label>
                  <p className="text-sm text-muted-foreground max-h-20 overflow-y-auto">
                    {application.jobDetails.benefits}
                  </p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Application Timeline */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Timeline</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Applied Date</label>
                <p className="text-sm">
                  {new Date(application.createdAt).toLocaleDateString()} at{' '}
                  {new Date(application.createdAt).toLocaleTimeString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Last Updated</label>
                <p className="text-sm">
                  {new Date(application.updatedAt).toLocaleDateString()} at{' '}
                  {new Date(application.updatedAt).toLocaleTimeString()}
                </p>
              </div>
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
