'use client';

import {
  ArrowLeft,
  Briefcase,
  Building,
  Camera,
  DollarSign,
  FileText,
  MapPin,
  Monitor,
  Settings,
  Target,
  User,
  Users,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

import { updateJobApplicationStatus } from '@/actions/job-application';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ApplicationDetailProps {
  application: {
    id: string;
    uuid: string;
    status: 'pending' | 'reviewed' | 'accepted' | 'rejected' | 'in_progress' | 'completed';
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
    sessionInstruction?: {
      screenMonitoring: boolean;
      screenMonitoringMode: 'photo' | 'video';
      screenMonitoringInterval?: number;
      cameraMonitoring: boolean;
      cameraMonitoringMode: 'photo' | 'video';
      cameraMonitoringInterval?: number;
    };
    instructionsForAi?: {
      instruction: string;
      difficultyLevel: string;
      questionMode: string;
      totalQuestions: number;
      categoryConfigs?: Array<{
        type: string;
        numberOfQuestions: number;
      }>;
      questions?: Array<{
        id: string;
        type: string;
        question: string;
        isAIGenerated?: boolean;
      }>;
    };
    monitoringImages?: {
      camera: Array<{
        s3Key: string;
        timestamp: string;
      }>;
      screen: Array<{
        s3Key: string;
        timestamp: string;
      }>;
    };
    jobInfo?: {
      id: string;
      title: string;
      description: string;
      skills: string[];
      benefits?: string;
      requirements?: string;
      location?: string;
      salary?: string;
      type?: string;
      experience?: string;
      organization?: {
        id: string;
        name: string;
        website?: string;
        description?: string;
        industry?: string;
      };
    };
    userInfo?: {
      id: string;
      name: string;
      email: string;
      avatar?: string;
    };
    createdAt: string;
    updatedAt: string;
  };
}

export default function JobApplicationDetailView({ application }: ApplicationDetailProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'reviewed':
        return <Badge variant="default">Reviewed</Badge>;
      case 'accepted':
        return <Badge variant="success">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      await updateJobApplicationStatus(
        application.id,
        newStatus as 'pending' | 'reviewed' | 'accepted' | 'rejected'
      );
      toast.success('Application status updated successfully');
      window.location.reload();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/recruiter/job-application">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Applications
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{application.jobDetails.title}</h1>
            <p className="text-sm text-muted-foreground">Application ID: {application.uuid}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(application.status)}
          <Select onValueChange={handleStatusUpdate} disabled={isUpdating}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Update Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="candidate">Candidate</TabsTrigger>
          <TabsTrigger value="job-details">Job Details</TabsTrigger>
          <TabsTrigger value="interview-config">Interview Config</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Application Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Application Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <div className="mt-1">{getStatusBadge(application.status)}</div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Language</p>
                    <p className="mt-1 capitalize">{application.preferredLanguage}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Applied</p>
                    <p className="mt-1">{new Date(application.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Updated</p>
                    <p className="mt-1">{new Date(application.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Candidate Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Candidate Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium">{application.candidate.name}</p>
                  <p className="text-sm text-muted-foreground">{application.candidate.email}</p>
                </div>
                {application.userInfo && (
                  <div className="pt-2">
                    <p className="text-sm font-medium text-muted-foreground">User ID</p>
                    <p className="text-sm">{application.userInfo.id}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Company Information */}
            {application.jobInfo?.organization && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Organization
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="font-medium">{application.jobInfo.organization.name}</p>
                    {application.jobInfo.organization.industry && (
                      <p className="text-sm text-muted-foreground">
                        {application.jobInfo.organization.industry}
                      </p>
                    )}
                  </div>
                  {application.jobInfo.organization.description && (
                    <p className="text-sm">{application.jobInfo.organization.description}</p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="candidate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Candidate Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="font-medium mb-3">Basic Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                      <p>{application.candidate.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Email Address</p>
                      <p>{application.candidate.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Preferred Language
                      </p>
                      <p className="capitalize">{application.preferredLanguage}</p>
                    </div>
                  </div>
                </div>

                {application.userInfo && (
                  <div>
                    <h3 className="font-medium mb-3">User Account</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">User ID</p>
                        <p className="font-mono text-sm">{application.userInfo.id}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Display Name</p>
                        <p>{application.userInfo.name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Account Email</p>
                        <p>{application.userInfo.email}</p>
                      </div>
                      {application.userInfo.avatar && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Avatar</p>
                          <Image
                            src={application.userInfo.avatar}
                            alt={application.userInfo.name}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="job-details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Complete Job Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">Job Title</h3>
                <p>{application.jobDetails.title}</p>
              </div>

              <div>
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {application.jobDetails.description}
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-2">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {application.jobDetails.skills.map((skill, index) => (
                    <Badge key={index} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {application.jobDetails.requirements && (
                <div>
                  <h3 className="font-medium mb-2">Requirements</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {application.jobDetails.requirements}
                  </p>
                </div>
              )}

              {application.jobDetails.benefits && (
                <div>
                  <h3 className="font-medium mb-2">Benefits</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {application.jobDetails.benefits}
                  </p>
                </div>
              )}

              {/* Extended Job Information */}
              {application.jobInfo && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-medium mb-4">Additional Job Details</h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      {application.jobInfo.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Location</p>
                            <p className="text-sm text-muted-foreground">
                              {application.jobInfo.location}
                            </p>
                          </div>
                        </div>
                      )}
                      {application.jobInfo.salary && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Salary</p>
                            <p className="text-sm text-muted-foreground">
                              {application.jobInfo.salary}
                            </p>
                          </div>
                        </div>
                      )}
                      {application.jobInfo.type && (
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Job Type</p>
                            <p className="text-sm text-muted-foreground">
                              {application.jobInfo.type}
                            </p>
                          </div>
                        </div>
                      )}
                      {application.jobInfo.experience && (
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Experience</p>
                            <p className="text-sm text-muted-foreground">
                              {application.jobInfo.experience}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interview-config" className="space-y-6">
          {application.sessionInstruction && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Session Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-3">
                    <h4 className="font-medium">Screen Monitoring</h4>
                    <div className="space-y-2 p-3 bg-muted rounded-md">
                      <p className="text-sm">
                        <span className="font-medium">Enabled:</span>{' '}
                        {application.sessionInstruction.screenMonitoring ? 'Yes' : 'No'}
                      </p>
                      {application.sessionInstruction.screenMonitoring && (
                        <>
                          <p className="text-sm">
                            <span className="font-medium">Mode:</span>{' '}
                            {application.sessionInstruction.screenMonitoringMode}
                          </p>
                          {application.sessionInstruction.screenMonitoringInterval && (
                            <p className="text-sm">
                              <span className="font-medium">Interval:</span>{' '}
                              {application.sessionInstruction.screenMonitoringInterval} seconds
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-medium">Camera Monitoring</h4>
                    <div className="space-y-2 p-3 bg-muted rounded-md">
                      <p className="text-sm">
                        <span className="font-medium">Enabled:</span>{' '}
                        {application.sessionInstruction.cameraMonitoring ? 'Yes' : 'No'}
                      </p>
                      {application.sessionInstruction.cameraMonitoring && (
                        <>
                          <p className="text-sm">
                            <span className="font-medium">Mode:</span>{' '}
                            {application.sessionInstruction.cameraMonitoringMode}
                          </p>
                          {application.sessionInstruction.cameraMonitoringInterval && (
                            <p className="text-sm">
                              <span className="font-medium">Interval:</span>{' '}
                              {application.sessionInstruction.cameraMonitoringInterval} seconds
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {application.instructionsForAi && (
            <Card>
              <CardHeader>
                <CardTitle>AI Interview Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Difficulty Level</p>
                    <p className="mt-1 capitalize">
                      {application.instructionsForAi.difficultyLevel}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Question Mode</p>
                    <p className="mt-1 capitalize">{application.instructionsForAi.questionMode}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Questions</p>
                    <p className="mt-1">{application.instructionsForAi.totalQuestions}</p>
                  </div>
                </div>

                {application.instructionsForAi.instruction && (
                  <div>
                    <h4 className="font-medium mb-2">Special Instructions</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap p-3 bg-muted rounded-md">
                      {application.instructionsForAi.instruction}
                    </p>
                  </div>
                )}

                {application.instructionsForAi.categoryConfigs &&
                  application.instructionsForAi.categoryConfigs.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Question Categories</h4>
                      <div className="space-y-2">
                        {application.instructionsForAi.categoryConfigs.map((config, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center p-3 border rounded-md"
                          >
                            <span className="capitalize font-medium">
                              {config.type.replace('-', ' ')}
                            </span>
                            <Badge variant="outline">{config.numberOfQuestions} questions</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {application.instructionsForAi.questions &&
                  application.instructionsForAi.questions.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Configured Questions</h4>
                      <div className="space-y-3">
                        {application.instructionsForAi.questions.map((question, index) => (
                          <div key={question.id} className="p-3 border rounded-md">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-sm font-medium">Question {index + 1}</span>
                              <div className="flex gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {question.type}
                                </Badge>
                                {question.isAIGenerated && (
                                  <Badge variant="secondary" className="text-xs">
                                    AI Generated
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <p className="text-sm">{question.question}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          {application.monitoringImages && (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Camera Images */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    Camera Captures
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {application.monitoringImages.camera.length > 0 ? (
                    <div className="space-y-3">
                      {application.monitoringImages.camera.map((image, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-2 border rounded"
                        >
                          <span className="text-sm font-mono">{image.s3Key}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(image.timestamp).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No camera captures recorded</p>
                  )}
                </CardContent>
              </Card>

              {/* Screen Images */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-5 w-5" />
                    Screen Captures
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {application.monitoringImages.screen.length > 0 ? (
                    <div className="space-y-3">
                      {application.monitoringImages.screen.map((image, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-2 border rounded"
                        >
                          <span className="text-sm font-mono">{image.s3Key}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(image.timestamp).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No screen captures recorded</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {!application.monitoringImages && (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">
                  No monitoring data available for this application
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
