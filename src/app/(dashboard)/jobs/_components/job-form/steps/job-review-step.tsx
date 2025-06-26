'use client';

import { Calendar, CheckCircle, ChevronLeft, Clock, Eye, HelpCircle, Settings } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { industriesData } from '@/lib/constants/industry-data';
import { calculateTotalQuestions, getDifficultyLevelInfo } from '@/lib/utils/job-utils';

interface Question {
  id: string;
  type: string;
  question: string;
  isAIGenerated?: boolean;
}

interface JobReviewStepProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  jobData: any;
  onPublish: () => void;
  onPrevious: () => void;
  isPublishing: boolean;
  canPublish: boolean;
  onSaveDraft?: () => void;
  isSavingDraft?: boolean;
}

export function JobReviewStep({
  jobData,
  onPublish,
  onPrevious,
  isPublishing,
  canPublish: _canPublish,
  onSaveDraft,
  isSavingDraft = false,
}: JobReviewStepProps) {
  const difficultyInfo = getDifficultyLevelInfo(
    jobData.interviewConfig?.difficultyLevel || 'normal'
  );
  const availableQuestionTypes =
    industriesData[jobData.industry as keyof typeof industriesData]?.questionTypes || [];
  const totalQuestions = calculateTotalQuestions(jobData.questionsConfig?.categoryConfigs || []);

  const handleSaveDraft = () => {
    if (onSaveDraft) {
      onSaveDraft();
    }
  };

  // Determine if job is currently published
  const isPublishedJob = jobData.status === 'published';
  const isDraftJob = jobData.status === 'draft' || !jobData.status;

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

      {/* Job Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Job Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <div className="text-2xl font-bold text-primary">{totalQuestions}</div>
              <div className="text-sm text-muted-foreground">Total Questions</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {jobData.interviewConfig?.duration || 0}
              </div>
              <div className="text-sm text-muted-foreground">Minutes</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{jobData.skills?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Required Skills</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {totalQuestions > 0 ? Math.round(totalQuestions * 2.5) : 0}
              </div>
              <div className="text-sm text-muted-foreground">Est. Time (min)</div>
            </div>
          </div>
        </CardContent>
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
              <p className="font-medium">{jobData.title || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Industry</p>
              <p className="font-medium capitalize">{jobData.industry || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Location</p>
              <p className="font-medium">{jobData.location || 'Not specified'}</p>
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
              {jobData.skills?.length > 0 ? (
                jobData.skills.map((skill: string) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No skills specified</p>
              )}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Expiry Date</p>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <p className="font-medium">
                {jobData.expiryDate
                  ? new Date(jobData.expiryDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'Not set'}
              </p>
              {jobData.expiryDate && new Date(jobData.expiryDate) < new Date() && (
                <Badge variant="destructive" className="text-xs">
                  Expired
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Description */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Job Description</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
            <p className="text-sm whitespace-pre-wrap">
              {jobData.description?.description || 'No description provided'}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Requirements</p>
            <p className="text-sm whitespace-pre-wrap">
              {jobData.description?.requirements || 'No requirements specified'}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Benefits</p>
            <p className="text-sm whitespace-pre-wrap">
              {jobData.description?.benefits || 'No benefits specified'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Interview Configuration */}
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
              <p className="font-medium">{jobData.interviewConfig?.duration || 0} minutes</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Difficulty Level</p>
              <div className="flex items-center gap-2">
                <Badge className={difficultyInfo.colorClass}>{difficultyInfo.label}</Badge>
                <difficultyInfo.icon className="h-4 w-4" />
              </div>
            </div>
          </div>

          {jobData.interviewConfig?.instructions && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Instructions</p>
              <p className="text-sm whitespace-pre-wrap">{jobData.interviewConfig.instructions}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Screen Monitoring</p>
              <div className="flex items-center gap-2">
                {jobData.interviewConfig?.screenMonitoring ? (
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
                {jobData.interviewConfig?.cameraMonitoring ? (
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

      {/* Questions Configuration */}
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
                variant={jobData.questionsConfig?.mode === 'ai-mode' ? 'default' : 'secondary'}
              >
                {jobData.questionsConfig?.mode === 'ai-mode' ? 'AI Mode' : 'Manual Questions'}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Questions</p>
              <p className="font-medium">{totalQuestions}</p>
            </div>
          </div>

          {jobData.questionsConfig?.categoryConfigs?.length > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Question Categories</p>
              <div className="space-y-2">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {jobData.questionsConfig.categoryConfigs.map((config: any) => {
                  const type = availableQuestionTypes.find((t) => t.value === config.type);
                  return (
                    <div
                      key={config.type}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{type?.label || config.type}</p>
                        <p className="text-sm text-muted-foreground">{type?.description}</p>
                      </div>
                      <Badge variant="outline">{config.numberOfQuestions} questions</Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Manual Questions Preview */}
          {jobData.questionsConfig?.mode === 'manual' &&
            jobData.questionsConfig.questions &&
            jobData.questionsConfig.questions.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-3">
                  Manual Questions Preview
                </p>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {jobData.questionsConfig.questions
                    .slice(0, 5)
                    .map((question: Question, index: number) => (
                      <div
                        key={question.id || index}
                        className="p-3 border rounded-lg bg-background"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {availableQuestionTypes.find((t) => t.value === question.type)?.label ||
                              question.type}
                          </Badge>
                          {question.isAIGenerated && (
                            <Badge variant="secondary" className="text-xs">
                              AI Generated
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm">{question.question}</p>
                      </div>
                    ))}
                  {jobData.questionsConfig.questions.length > 5 && (
                    <p className="text-xs text-muted-foreground text-center py-2">
                      ... and {jobData.questionsConfig.questions.length - 5} more questions
                    </p>
                  )}
                </div>
              </div>
            )}
        </CardContent>
      </Card>

      {/* Publish Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <Button variant="outline" onClick={onPrevious}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex gap-3">
              {/* Show Save as Draft button only if job is published */}
              {isPublishedJob && (
                <Button variant="outline" onClick={handleSaveDraft} disabled={isSavingDraft}>
                  {isSavingDraft ? 'Saving...' : 'Save as Draft'}
                </Button>
              )}

              {/* Show different button text based on current status */}
              <Button
                onClick={onPublish}
                disabled={isPublishing}
                className="bg-green-600 hover:bg-green-700"
              >
                {isPublishing
                  ? 'Publishing...'
                  : isPublishedJob
                    ? 'Update Published Job'
                    : 'Publish Job'}
                <Eye className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Status indicator */}
          <div className="mt-4 text-center">
            <div className="text-sm text-muted-foreground">
              Current Status:{' '}
              <span
                className={`font-medium ${
                  isPublishedJob
                    ? 'text-green-600'
                    : isDraftJob
                      ? 'text-amber-600'
                      : 'text-gray-600'
                }`}
              >
                {jobData.status
                  ? jobData.status.charAt(0).toUpperCase() + jobData.status.slice(1)
                  : 'Draft'}
              </span>
            </div>
            {isPublishedJob && (
              <div className="text-xs text-muted-foreground mt-1">
                This job is currently live and accepting applications. Click &quot;Save as
                Draft&quot; to unpublish and make it a draft again.
              </div>
            )}
            {isDraftJob && (
              <div className="text-xs text-muted-foreground mt-1">
                This job is currently a draft. Click &quot;Publish Job&quot; to make it live.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
