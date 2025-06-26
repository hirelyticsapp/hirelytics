'use client';

import { Calendar, CheckCircle, ChevronLeft, Clock, Eye, HelpCircle, Settings } from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { industriesData } from '@/lib/constants/industry-data';
import { calculateTotalQuestions, getDifficultyLevelInfo } from '@/lib/utils/job-utils';

interface JobReviewStepProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  jobData: any;
  onPublish: () => void;
  onPrevious: () => void;
  isPublishing: boolean;
  canPublish: boolean;
}

export function JobReviewStep({
  jobData,
  onPublish,
  onPrevious,
  isPublishing,
  canPublish,
}: JobReviewStepProps) {
  const difficultyInfo = getDifficultyLevelInfo(
    jobData.interviewConfig?.difficultyLevel || 'normal'
  );
  const availableQuestionTypes =
    industriesData[jobData.industry as keyof typeof industriesData]?.questionTypes || [];
  const totalQuestions = calculateTotalQuestions(jobData.questionsConfig?.categoryConfigs || []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Review & Publish
          </CardTitle>
          <CardDescription>
            Review all job details before publishing. Once published, candidates will be able to
            apply.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Basic Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Basic Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Job Title</p>
              <p className="font-medium">{jobData.title}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Industry</p>
              <p className="font-medium capitalize">{jobData.industry}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Location</p>
              <p className="font-medium">{jobData.location}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Salary</p>
              <p className="font-medium">
                {jobData.salary ? `${jobData.currency} ${jobData.salary}` : 'Not specified'}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Required Skills</p>
            <div className="flex flex-wrap gap-2">
              {jobData.skills?.map((skill: string) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Expiry Date</p>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <p className="font-medium">
                {jobData.expiryDate ? new Date(jobData.expiryDate).toLocaleDateString() : 'Not set'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Description */}
      {jobData.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Job Description</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
              <p className="text-sm whitespace-pre-wrap">{jobData.description.description}</p>
            </div>

            {jobData.description.requirements && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Requirements</p>
                <p className="text-sm whitespace-pre-wrap">{jobData.description.requirements}</p>
              </div>
            )}

            {jobData.description.benefits && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Benefits</p>
                <p className="text-sm whitespace-pre-wrap">{jobData.description.benefits}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Interview Configuration */}
      {jobData.interviewConfig && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Interview Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Duration</p>
                <p className="font-medium">{jobData.interviewConfig.duration} minutes</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Difficulty Level</p>
                <div className="flex items-center gap-2">
                  <Badge className={difficultyInfo.colorClass}>{difficultyInfo.label}</Badge>
                  <difficultyInfo.icon className="h-4 w-4" />
                </div>
              </div>
            </div>

            {jobData.interviewConfig.instructions && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Instructions</p>
                <p className="text-sm whitespace-pre-wrap">
                  {jobData.interviewConfig.instructions}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Screen Monitoring</p>
                <div className="flex items-center gap-2">
                  {jobData.interviewConfig.screenMonitoring ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">
                        Enabled ({jobData.interviewConfig.screenMonitoringMode}, every{' '}
                        {jobData.interviewConfig.screenMonitoringInterval}s)
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-muted-foreground">Disabled</span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Camera Monitoring</p>
                <div className="flex items-center gap-2">
                  {jobData.interviewConfig.cameraMonitoring ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">
                        Enabled ({jobData.interviewConfig.cameraMonitoringMode}, every{' '}
                        {jobData.interviewConfig.cameraMonitoringInterval}s)
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-muted-foreground">Disabled</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Questions Configuration */}
      {jobData.questionsConfig && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Questions Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Generation Mode</p>
                <Badge
                  variant={jobData.questionsConfig.mode === 'ai-mode' ? 'default' : 'secondary'}
                >
                  {jobData.questionsConfig.mode === 'ai-mode' ? 'AI Mode' : 'Manual Questions'}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Questions</p>
                <p className="font-medium">{totalQuestions}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Question Categories</p>
              <div className="space-y-2">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {jobData.questionsConfig.categoryConfigs?.map((config: any) => {
                  const type = availableQuestionTypes.find((t) => t.value === config.type);
                  return (
                    <div
                      key={config.type}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{type?.label}</p>
                        <p className="text-sm text-muted-foreground">{type?.description}</p>
                      </div>
                      <Badge variant="outline">{config.numberOfQuestions} questions</Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Publish Actions */}
      <Card>
        <CardContent className="pt-6">
          {!canPublish && (
            <Alert className="mb-4">
              <AlertDescription>
                Please complete all required steps before publishing the job.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <Button variant="outline" onClick={onPrevious}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex gap-3">
              <Button variant="outline" disabled={!canPublish}>
                Save as Draft
              </Button>
              <Button
                onClick={onPublish}
                disabled={!canPublish || isPublishing}
                className="bg-green-600 hover:bg-green-700"
              >
                {isPublishing ? 'Publishing...' : 'Publish Job'}
                <Eye className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
