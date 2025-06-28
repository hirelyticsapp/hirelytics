'use client';

import {
  ArrowLeft,
  Briefcase,
  Building,
  DollarSign,
  FileText,
  Mail,
  MapPin,
  Settings,
  Target,
  User,
} from 'lucide-react';
import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface JobApplicationDetail {
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
}

interface JobApplicationDetailViewProps {
  application: JobApplicationDetail;
}

export default function JobApplicationDetailView({ application }: JobApplicationDetailViewProps) {
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

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/applied-jobs">
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
        {getStatusBadge(application.status)}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="candidate">Candidate</TabsTrigger>
          <TabsTrigger value="job-details">Job Details</TabsTrigger>
          <TabsTrigger value="interview-settings">Interview Settings</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Application Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Application Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <div className="mt-1">{getStatusBadge(application.status)}</div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Preferred Language</p>
                    <p className="mt-1 capitalize">{application.preferredLanguage}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Applied Date</p>
                    <p className="mt-1">{new Date(application.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                    <p className="mt-1">{new Date(application.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full">
                  Update Status
                </Button>
                <Button variant="outline" className="w-full">
                  <Mail className="mr-2 h-4 w-4" />
                  Contact Candidate
                </Button>
                <Button variant="outline" className="w-full">
                  Schedule Interview
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="candidate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Candidate Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={application.userInfo?.avatar}
                    alt={application.candidate.name}
                  />
                  <AvatarFallback>
                    {application.candidate.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{application.candidate.name}</h3>
                  <p className="text-muted-foreground">{application.candidate.email}</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="mt-1">{application.candidate.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="mt-1">{application.candidate.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Preferred Language</p>
                  <p className="mt-1 capitalize">{application.preferredLanguage}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">User ID</p>
                  <p className="mt-1 text-xs font-mono">{application.userInfo?.id}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="job-details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Position Details</CardTitle>
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

              {/* Additional Job Info */}
              {application.jobInfo && (
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
                        <p className="text-sm text-muted-foreground">{application.jobInfo.type}</p>
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
              )}

              {/* Company Information */}
              {application.jobInfo?.organization && (
                <div className="border-t pt-6">
                  <h3 className="font-medium mb-4 flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Company Information
                  </h3>
                  <div className="space-y-3">
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
                    {application.jobInfo.organization.website && (
                      <a
                        href={application.jobInfo.organization.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Visit Company Website
                      </a>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interview-settings" className="space-y-6">
          {application.sessionInstruction && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Monitoring Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="font-medium">Screen Monitoring</h4>
                    <div className="space-y-1">
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
                              {application.sessionInstruction.screenMonitoringInterval}s
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Camera Monitoring</h4>
                    <div className="space-y-1">
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
                              {application.sessionInstruction.cameraMonitoringInterval}s
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
                <CardTitle>Interview Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {application.instructionsForAi.instruction}
                    </p>
                  </div>
                )}

                {application.instructionsForAi.categoryConfigs &&
                  application.instructionsForAi.categoryConfigs.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Question Categories</h4>
                      <div className="space-y-2">
                        {application.instructionsForAi.categoryConfigs.map((config, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center p-3 bg-muted rounded-md"
                          >
                            <span className="capitalize">{config.type.replace('-', ' ')}</span>
                            <Badge variant="outline">{config.numberOfQuestions} questions</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {application.instructionsForAi.questions &&
                  application.instructionsForAi.questions.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Custom Questions</h4>
                      <div className="space-y-3">
                        {application.instructionsForAi.questions.map((question, index) => (
                          <div key={question.id} className="p-3 border rounded-md">
                            <div className="flex items-center justify-between mb-2">
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

        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">Application Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 border rounded-md">
                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium">Application Submitted</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(application.createdAt).toLocaleDateString()} at{' '}
                      {new Date(application.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                {application.updatedAt !== application.createdAt && (
                  <div className="flex items-center gap-3 p-3 border rounded-md">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium">Status Updated</p>
                      <p className="text-sm text-muted-foreground">
                        Last updated on {new Date(application.updatedAt).toLocaleDateString()} at{' '}
                        {new Date(application.updatedAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 p-3 border-2 border-primary rounded-md bg-primary/5">
                  <div className="h-2 w-2 bg-primary rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium">Current Status</p>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusBadge(application.status)}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
