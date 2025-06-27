'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Award,
  Briefcase,
  Building,
  Calendar,
  Clock,
  DollarSign,
  Globe,
  MapPin,
  Users,
} from 'lucide-react';

import { JobInvitation } from '@/@types/job';
import { getJobDetails } from '@/actions/job-invite';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

import AcceptInvitationButton from './accept-invitaion-button';
import ApplyJobInvitationButton from './apply-job-button';
import DeclineInvitationButton from './decline-invitaion-button';

interface JobDetailsModalProps {
  jobInvitationDetails: JobInvitation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface JobDetails {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  benefits: string[];
  location: string;
  salary: string;
  type: string;
  experience: string;
  department: string;
  skills: string[];
  status: string;
  deadline: string;
  createdAt: string;
  updatedAt: string;
  organizationDetails: {
    id: string;
    name: string;
    description: string;
    website?: string;
    industry?: string;
    size?: string;
    logo?: string;
  };
  createdByDetails: {
    id: string;
    name: string;
    email: string;
  };
}

export function JobDetailsModal({
  jobInvitationDetails,
  open,
  onOpenChange,
}: JobDetailsModalProps) {
  const {
    data: job,
    isLoading,
    error,
  } = useQuery<JobDetails>({
    queryKey: ['job-details', jobInvitationDetails?.jobId],
    queryFn: () => getJobDetails(jobInvitationDetails?.jobId as string),
    enabled: !!jobInvitationDetails?.jobId && open,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Job Details{' '}
            {jobInvitationDetails?.status === 'declined' && (
              <Badge variant={'destructive'}>This invitation has been declined</Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading job details...</span>
          </div>
        )}

        {error && (
          <div className="p-4 border border-destructive/50 rounded-lg bg-destructive/10">
            <p className="text-sm text-destructive">
              Error loading job details: {(error as Error).message}
            </p>
          </div>
        )}

        {job && (
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                {job.organizationDetails?.logo && (
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={job.organizationDetails.logo}
                      alt={job.organizationDetails.name}
                    />
                    <AvatarFallback className="text-lg">
                      {job.organizationDetails.name?.charAt(0) || 'C'}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold">{job.title}</h1>
                  <p className="text-xl text-muted-foreground">{job.organizationDetails?.name}</p>
                  {job.organizationDetails?.industry && (
                    <p className="text-sm text-muted-foreground">
                      {job.organizationDetails.industry}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  <MapPin className="h-3 w-3 mr-1" />
                  {job.location}
                </Badge>
                <Badge variant="secondary">
                  <Briefcase className="h-3 w-3 mr-1" />
                  {job.type}
                </Badge>
                <Badge variant="secondary">
                  <Users className="h-3 w-3 mr-1" />
                  {job.experience}
                </Badge>
                {job.department && (
                  <Badge variant="secondary">
                    <Building className="h-3 w-3 mr-1" />
                    {job.department}
                  </Badge>
                )}
              </div>
            </div>

            <Separator />

            {/* Job Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {job.salary && (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Salary Range
                    </h3>
                    <p className="text-muted-foreground">{job.salary}</p>
                  </div>
                )}

                {job.deadline && (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Application Deadline
                    </h3>
                    <p className="text-muted-foreground">
                      {new Date(job.deadline).toLocaleDateString()}
                    </p>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-2 flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Posted
                  </h3>
                  <p className="text-muted-foreground">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {job.organizationDetails?.size && (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      Company Size
                    </h3>
                    <p className="text-muted-foreground">{job.organizationDetails.size}</p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">About the Company</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {job.organizationDetails?.description || 'No company description available.'}
                  </p>
                </div>

                {job.organizationDetails?.website && (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center">
                      <Globe className="h-4 w-4 mr-2" />
                      Website
                    </h3>
                    <a
                      href={job.organizationDetails.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm"
                    >
                      {job.organizationDetails.website}
                    </a>
                  </div>
                )}

                {job.createdByDetails && (
                  <div>
                    <h3 className="font-semibold mb-2">Posted by</h3>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {job.createdByDetails.name?.charAt(0) || 'R'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{job.createdByDetails.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {job.createdByDetails.email}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h3 className="font-semibold mb-3">Job Description</h3>
              <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {job.description}
              </div>
            </div>

            {/* Skills */}
            {job.skills && Array.isArray(job.skills) && job.skills.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center">
                  <Award className="h-4 w-4 mr-2" />
                  Required Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <Badge key={index} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Requirements */}
            {job.requirements && Array.isArray(job.requirements) && job.requirements.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Requirements</h3>
                <ul className="space-y-2">
                  {job.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span className="text-muted-foreground">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Benefits */}
            {job.benefits && Array.isArray(job.benefits) && job.benefits.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Benefits</h3>
                <ul className="space-y-2">
                  {job.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span className="text-muted-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Separator />
          </div>
        )}
        <DialogFooter>
          <div className="flex gap-3 pt-4">
            {jobInvitationDetails?.status === 'pending' && (
              <>
                <AcceptInvitationButton
                  invitationId={jobInvitationDetails.id}
                  jobId={jobInvitationDetails.jobId}
                  onSuccess={() => onOpenChange(false)}
                />
                <DeclineInvitationButton
                  invitationId={jobInvitationDetails.id}
                  jobId={jobInvitationDetails.jobId}
                  onSuccess={() => onOpenChange(false)}
                />
              </>
            )}

            {jobInvitationDetails?.status === 'accepted' && (
              <ApplyJobInvitationButton invitationId={jobInvitationDetails.id} />
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
