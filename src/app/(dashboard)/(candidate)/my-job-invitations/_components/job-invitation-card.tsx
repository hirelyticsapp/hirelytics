import { IconArrowBadgeRight } from '@tabler/icons-react';
import {
  Briefcase,
  Building,
  Calendar,
  Check,
  Clock,
  DollarSign,
  Eye,
  MapPin,
  X,
} from 'lucide-react';
import { useState } from 'react';

import { JobInvitation } from '@/@types/job';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import AcceptInvitationButton from './accept-invitaion-button';
import DeclineInvitationButton from './decline-invitaion-button';
import { JobDetailsModal } from './job-details-modal';

export default function JobInvitationCard({ jobInvitation }: { jobInvitation: JobInvitation }) {
  const [selectedJob, setSelectedJob] = useState<JobInvitation | null>(null);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const getStatusVariant = (
    status: string
  ): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'pending':
        return 'default';
      case 'accepted':
        return 'secondary';
      case 'declined':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-3 w-3" />;
      case 'accepted':
        return <Check className="h-3 w-3" />;
      case 'declined':
        return <X className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <>
      <Card
        key={jobInvitation.id}
        className="group hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20"
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-bold leading-tight">
                {truncateText(jobInvitation.jobDetails.title, 50)}
              </CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={getStatusVariant(jobInvitation.status)} className="text-xs">
                  {getStatusIcon(jobInvitation.status)}
                  <span className="ml-1 capitalize">{jobInvitation.status}</span>
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
              {truncateText(jobInvitation.jobDetails.description, 120)}
            </p>

            {/* Job Details */}
            <div className="space-y-2">
              {jobInvitation.jobDetails.organizationName && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Building className="h-3 w-3" />
                  <span>{jobInvitation.jobDetails.organizationName}</span>
                </div>
              )}

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{jobInvitation.jobDetails.location || 'Remote'}</span>
                </div>
                {jobInvitation.jobDetails.type && (
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    <span>{jobInvitation.jobDetails.type}</span>
                  </div>
                )}
              </div>

              {jobInvitation.jobDetails.salary && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <DollarSign className="h-3 w-3" />
                  <span>{jobInvitation.jobDetails.salary}</span>
                </div>
              )}
            </div>

            {/* Recruiter Info */}
            <div className="flex items-center gap-2 text-sm p-2 rounded-lg bg-muted/30">
              <Avatar className="h-6 w-6">
                <AvatarImage src={jobInvitation.invitedByDetails.avatar} />
                <AvatarFallback className="text-xs">
                  {jobInvitation.invitedByDetails.name?.charAt(0) || 'R'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Invited by</p>
                <p className="font-medium truncate text-sm">
                  {jobInvitation.invitedByDetails.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>Invited on {new Date(jobInvitation.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          {jobInvitation?.status === 'declined' && (
            <Badge variant={'destructive'}>This invitation has been declined</Badge>
          )}

          <div className="flex gap-2 pt-2">
            {jobInvitation?.status === 'pending' && (
              <>
                <AcceptInvitationButton
                  invitationId={jobInvitation.id}
                  jobId={jobInvitation.jobId}
                />
                <DeclineInvitationButton
                  invitationId={jobInvitation.id}
                  jobId={jobInvitation.jobId}
                />
              </>
            )}

            {jobInvitation?.status === 'accepted' && (
              <Button size="sm" className="flex-1">
                <IconArrowBadgeRight className="h-3 w-3 mr-1" />
                Apply
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              className={jobInvitation?.status === 'pending' ? '' : 'flex-1'}
              onClick={() => {
                setSelectedJob(jobInvitation);
                setIsJobModalOpen(true);
              }}
            >
              <Eye className="h-3 w-3 mr-1" />
              View Job
            </Button>
          </div>
        </CardContent>
      </Card>
      {/* Job Details Modal */}
      <JobDetailsModal
        jobInvitationDetails={selectedJob}
        open={isJobModalOpen}
        onOpenChange={setIsJobModalOpen}
      />
    </>
  );
}
