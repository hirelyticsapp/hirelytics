'use client';

import { Check, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useQueryState } from 'nuqs';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  usePublishJobMutation,
  useUpdateJobBasicDetailsMutation,
  useUpdateJobDescriptionMutation,
  useUpdateJobInterviewConfigMutation,
  useUpdateJobQuestionsConfigMutation,
} from '@/hooks/use-job-queries';
import { formSteps } from '@/lib/constants/job-constants';
import type {
  BasicJobDetails,
  CompleteJob,
  InterviewConfig,
  JobDescription,
  JobStepCompletion,
  QuestionsConfig,
} from '@/lib/schemas/job-schemas';
import { canAccessStep, getStepCompletionPercentage } from '@/lib/utils/job-utils';

import { BasicDetailsStep } from './steps/basic-details-step';
import { InterviewConfigStep } from './steps/interview-config-step';
import { JobDescriptionStep } from './steps/job-description-step';
import { JobReviewStep } from './steps/job-review-step';
import { QuestionsConfigStep } from './steps/questions-config-step';

interface JobDetailsPageProps {
  jobId: string;
  initialData?: Partial<CompleteJob>;
}

export function JobDetailsPage({ jobId, initialData }: JobDetailsPageProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useQueryState('step', {
    defaultValue: 0,
    parse: (value) => parseInt(value) || 0,
    serialize: (value) => value.toString(),
  });

  // Initialize mutations
  const updateBasicDetailsMutation = useUpdateJobBasicDetailsMutation(jobId);
  const updateDescriptionMutation = useUpdateJobDescriptionMutation(jobId);
  const updateInterviewConfigMutation = useUpdateJobInterviewConfigMutation(jobId);
  const updateQuestionsConfigMutation = useUpdateJobQuestionsConfigMutation(jobId);
  const publishJobMutation = usePublishJobMutation();

  const [completionStatus, setCompletionStatus] = useState<JobStepCompletion>({
    basicDetails: !!initialData?.title, // Mark as completed if we have initial data
    description: !!initialData?.description,
    interviewConfig: !!initialData?.interviewConfig,
    questionsConfig: !!initialData?.questionsConfig,
  });
  const [jobData, setJobData] = useState(initialData || {});

  // Calculate if any mutation is loading
  const isSaving =
    updateBasicDetailsMutation.isPending ||
    updateDescriptionMutation.isPending ||
    updateInterviewConfigMutation.isPending ||
    updateQuestionsConfigMutation.isPending;

  const isPublishing = publishJobMutation.isPending;

  const completionPercentage = getStepCompletionPercentage(completionStatus);

  const handleStepComplete = async (
    stepKey: string,
    data: Record<string, unknown>,
    shouldMoveNext = false
  ) => {
    try {
      // Save to database based on step using React Query mutations
      let result;
      switch (stepKey) {
        case 'basicDetails':
          result = await updateBasicDetailsMutation.mutateAsync(data as BasicJobDetails);
          break;
        case 'description':
          result = await updateDescriptionMutation.mutateAsync(data as JobDescription);
          break;
        case 'interviewConfig':
          result = await updateInterviewConfigMutation.mutateAsync(data as InterviewConfig);
          break;
        case 'questionsConfig':
          result = await updateQuestionsConfigMutation.mutateAsync(data as QuestionsConfig);
          break;
      }

      // Check if the mutation was successful
      if (result?.success) {
        // Update local state only after successful save
        setCompletionStatus((prev) => ({
          ...prev,
          [stepKey]: true,
        }));

        setJobData((prev) => ({
          ...prev,
          ...data,
        }));

        // Move to next step only if requested and save was successful
        if (shouldMoveNext && currentStep < formSteps.length - 1) {
          setCurrentStep(currentStep + 1);
        }
      } else {
        console.error(`Error updating ${stepKey}:`, result?.error);
      }
    } catch (error) {
      console.error(`Error updating ${stepKey}:`, error);
      // You might want to show a toast notification here
    }
  };

  const handleStepChange = (stepIndex: number) => {
    if (canAccessStep(stepIndex, completionStatus)) {
      setCurrentStep(stepIndex);
    }
  };

  const handlePublishJob = async () => {
    try {
      const result = await publishJobMutation.mutateAsync(jobId);
      if (result.success) {
        router.push('/jobs');
      } else {
        console.error('Error publishing job:', result.error);
      }
    } catch (error) {
      console.error('Error publishing job:', error);
    }
  };

  const canPublish = Object.values(completionStatus).every(Boolean);

  const allSteps = [...formSteps.map((step, index) => ({ ...step, id: index + 1 }))];

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <BasicDetailsStep
            initialData={jobData}
            onComplete={(data: BasicJobDetails, shouldMoveNext?: boolean) =>
              handleStepComplete('basicDetails', data, shouldMoveNext)
            }
            isSaving={isSaving}
          />
        );
      case 1:
        return (
          <JobDescriptionStep
            initialData={{
              description: jobData.description,
              requirements: jobData.requirements,
              benefits: jobData.benefits,
            }}
            jobTitle={jobData.title}
            industry={jobData.industry || ''}
            skills={jobData.skills}
            location={jobData.location}
            onComplete={(data: JobDescription, shouldMoveNext?: boolean) =>
              handleStepComplete('description', data, shouldMoveNext)
            }
            onPrevious={() => setCurrentStep(0)}
            isSaving={isSaving}
          />
        );
      case 2:
        return (
          <InterviewConfigStep
            initialData={jobData.interviewConfig}
            onComplete={(data: InterviewConfig, shouldMoveNext?: boolean) =>
              handleStepComplete('interviewConfig', data, shouldMoveNext)
            }
            onPrevious={() => setCurrentStep(1)}
            isSaving={isSaving}
          />
        );
      case 3:
        return (
          <QuestionsConfigStep
            initialData={jobData.questionsConfig}
            industry={jobData.industry || ''}
            jobTitle={jobData.title}
            difficultyLevel={jobData.interviewConfig?.difficultyLevel}
            onComplete={(data: QuestionsConfig, shouldMoveNext?: boolean) =>
              handleStepComplete('questionsConfig', data, shouldMoveNext)
            }
            onPrevious={() => setCurrentStep(2)}
            isSaving={isSaving}
          />
        );
      case 4:
        return (
          <JobReviewStep
            jobData={jobData}
            onPublish={handlePublishJob}
            onPrevious={() => setCurrentStep(3)}
            isPublishing={isPublishing}
            canPublish={canPublish}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile-friendly header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => router.back()}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold">Job Setup</h1>
                <p className="text-sm text-muted-foreground">{completionPercentage}% complete</p>
              </div>
            </div>
            <Badge variant={canPublish ? 'default' : 'secondary'}>
              {canPublish ? 'Ready' : 'In Progress'}
            </Badge>
          </div>

          {/* Progress bar */}
          <Progress value={completionPercentage} className="mt-3" />
        </div>
      </div>

      {/* Mobile-friendly step navigation */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {allSteps.map((step, index) => {
            const isCompleted = completionStatus[step.key as keyof JobStepCompletion];
            const isCurrent = currentStep === index;
            const canAccess = canAccessStep(index, completionStatus);

            return (
              <button
                key={step.id}
                onClick={() => handleStepChange(index)}
                disabled={!canAccess}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors text-sm ${
                  isCurrent
                    ? 'bg-primary text-primary-foreground border-primary'
                    : isCompleted
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
                      : canAccess
                        ? 'hover:bg-muted border-border'
                        : 'opacity-50 cursor-not-allowed border-border'
                }`}
              >
                <div
                  className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium ${
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : isCurrent
                        ? 'bg-primary-foreground text-primary'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isCompleted ? <Check className="h-3 w-3" /> : step.id + 1}
                </div>
                <span className="hidden sm:inline">{step.title}</span>
              </button>
            );
          })}
        </div>

        {/* Step content */}
        <div className="max-w-4xl mx-auto">{renderStepContent()}</div>
      </div>
    </div>
  );
}
