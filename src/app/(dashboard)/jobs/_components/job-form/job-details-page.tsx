'use client';

import { Check, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { formSteps } from '@/lib/constants/job-constants';
import type { CompleteJob, JobStepCompletion } from '@/lib/schemas/job-schemas';
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
  const [currentStep, setCurrentStep] = useState(0); // Start from basic details
  const [completionStatus, setCompletionStatus] = useState<JobStepCompletion>({
    basicDetails: true, // Already completed in popup
    description: false,
    interviewConfig: false,
    questionsConfig: false,
  });
  const [jobData, setJobData] = useState(initialData || {});
  const [isPublishing, setIsPublishing] = useState(false);

  const completionPercentage = getStepCompletionPercentage(completionStatus);

  const handleStepComplete = (stepKey: string, data: any) => {
    setCompletionStatus((prev) => ({
      ...prev,
      [stepKey]: true,
    }));

    setJobData((prev) => ({
      ...prev,
      [stepKey]: data,
    }));
  };

  const handleStepChange = (stepIndex: number) => {
    if (canAccessStep(stepIndex, completionStatus)) {
      setCurrentStep(stepIndex);
    }
  };

  const handlePublishJob = async () => {
    setIsPublishing(true);
    try {
      console.log('Publishing job:', jobData);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      router.push('/jobs');
    } catch (error) {
      console.error('Error publishing job:', error);
    } finally {
      setIsPublishing(false);
    }
  };

  const canPublish = Object.values(completionStatus).every(Boolean);

  const allSteps = [
    {
      id: 0,
      title: 'Basic Details',
      description: 'Job title, organization, salary, and skills',
      key: 'basicDetails',
    },
    ...formSteps.map((step, index) => ({ ...step, id: index + 1 })),
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <BasicDetailsStep
            initialData={jobData}
            onComplete={(data) => handleStepComplete('basicDetails', data)}
            onNext={() => setCurrentStep(1)}
          />
        );
      case 1:
        return (
          <JobDescriptionStep
            initialData={jobData.description}
            jobTitle={jobData.title}
            industry={jobData.industry}
            skills={jobData.skills}
            location={jobData.location}
            onComplete={(data) => handleStepComplete('description', data)}
            onNext={() => setCurrentStep(2)}
            onPrevious={() => setCurrentStep(0)}
          />
        );
      case 2:
        return (
          <InterviewConfigStep
            initialData={jobData.interviewConfig}
            onComplete={(data) => handleStepComplete('interviewConfig', data)}
            onNext={() => setCurrentStep(3)}
            onPrevious={() => setCurrentStep(1)}
          />
        );
      case 3:
        return (
          <QuestionsConfigStep
            initialData={jobData.questionsConfig}
            industry={jobData.industry}
            jobTitle={jobData.title}
            difficultyLevel={jobData.interviewConfig?.difficultyLevel}
            onComplete={(data) => handleStepComplete('questionsConfig', data)}
            onNext={() => setCurrentStep(4)}
            onPrevious={() => setCurrentStep(2)}
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
