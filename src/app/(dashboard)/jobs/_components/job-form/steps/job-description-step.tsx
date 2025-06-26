'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft, ChevronRight, Loader2, Save, Sparkles } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useGenerateJobDescriptionMutation } from '@/hooks/use-job-queries';
import { type JobDescription, jobDescriptionSchema } from '@/lib/schemas/job-schemas';

interface JobDescriptionStepProps {
  initialData?: Partial<JobDescription>;
  jobTitle?: string;
  industry?: string;
  skills?: string[];
  location?: string;
  onComplete: (data: JobDescription, shouldMoveNext?: boolean) => Promise<void>;
  onPrevious: () => void;
  isSaving?: boolean;
}

export function JobDescriptionStep({
  initialData,
  jobTitle,
  industry,
  skills,
  location,
  onComplete,
  onPrevious,
  isSaving = false,
}: JobDescriptionStepProps) {
  const generateJobDescriptionMutation = useGenerateJobDescriptionMutation();

  const form = useForm<JobDescription>({
    resolver: zodResolver(jobDescriptionSchema),
    defaultValues: {
      description: initialData?.description || '',
      requirements: initialData?.requirements || '',
      benefits: initialData?.benefits || '',
    },
  });

  const generateDescription = async () => {
    if (!jobTitle || !industry || !skills || !location) {
      return;
    }

    try {
      const result = await generateJobDescriptionMutation.mutateAsync({
        jobTitle,
        industry,
        skills,
        location,
      });

      if (result.success) {
        form.setValue('description', result.data.description);
        form.setValue('requirements', result.data.requirements);
        form.setValue('benefits', result.data.benefits);
      }
    } catch (error) {
      console.error('Failed to generate description:', error);
    }
  };

  const onSubmit = async (data: JobDescription) => {
    await onComplete(data, true); // Save and move to next step
  };

  const handleSave = async () => {
    const formData = form.getValues();
    const isValid = await form.trigger();
    if (isValid) {
      await onComplete(formData, false); // Save without moving to next step
    }
  };

  const handleSaveAndContinue = async () => {
    const formData = form.getValues();
    const isValid = await form.trigger();
    if (isValid) {
      await onComplete(formData, true); // Save and move to next step
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Job Description & Details</CardTitle>
            <CardDescription>
              Provide detailed information about the job role, requirements, and benefits
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={generateDescription}
            disabled={generateJobDescriptionMutation.isPending || !jobTitle || !industry}
            className="gap-2"
          >
            {generateJobDescriptionMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                AI Generate
              </>
            )}
          </Button>
        </div>
        {(!jobTitle || !industry) && (
          <Alert>
            <AlertDescription>
              Complete basic details first to enable AI generation
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the role, responsibilities, and what the candidate will be doing..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="requirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Requirements</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="List the required qualifications, experience, and skills..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="benefits"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Benefits</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the benefits, perks, and what makes this role attractive..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onPrevious}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save
                </Button>
                <Button type="button" onClick={handleSaveAndContinue} disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <>
                      Save & Continue
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
