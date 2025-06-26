'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Camera, ChevronLeft, ChevronRight, Loader2, Monitor, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { difficultyLevels } from '@/lib/constants/job-constants';
import { type InterviewConfig, interviewConfigSchema } from '@/lib/schemas/job-schemas';
import { getDifficultyLevelInfo } from '@/lib/utils/job-utils';

interface InterviewConfigStepProps {
  initialData?: Partial<InterviewConfig>;
  onComplete: (data: InterviewConfig, shouldMoveNext?: boolean) => Promise<void>;
  onPrevious: () => void;
  isSaving?: boolean;
}

export function InterviewConfigStep({
  initialData,
  onComplete,
  onPrevious,
  isSaving = false,
}: InterviewConfigStepProps) {
  const form = useForm<InterviewConfig>({
    resolver: zodResolver(interviewConfigSchema),
    defaultValues: {
      duration: initialData?.duration ?? 60,
      instructions: initialData?.instructions ?? '',
      difficultyLevel: initialData?.difficultyLevel ?? 'normal',
      screenMonitoring: initialData?.screenMonitoring ?? false,
      screenMonitoringMode: initialData?.screenMonitoringMode ?? 'photo',
      screenMonitoringInterval: initialData?.screenMonitoringInterval ?? 30,
      cameraMonitoring: initialData?.cameraMonitoring ?? false,
      cameraMonitoringMode: initialData?.cameraMonitoringMode ?? 'photo',
      cameraMonitoringInterval: initialData?.cameraMonitoringInterval ?? 30,
    },
  });

  const watchScreenMonitoring = form.watch('screenMonitoring');
  const watchCameraMonitoring = form.watch('cameraMonitoring');

  // Helper function to create clean, serializable data
  const createCleanData = (data: Partial<InterviewConfig>): InterviewConfig => {
    // Ensure all values are properly typed and validated
    const cleanObject = {
      duration: Number(data.duration) || 60,
      instructions: String(data.instructions || ''),
      difficultyLevel: data.difficultyLevel || 'normal',
      screenMonitoring: Boolean(data.screenMonitoring),
      screenMonitoringMode: data.screenMonitoringMode || 'photo',
      screenMonitoringInterval: Number(data.screenMonitoringInterval) || 30,
      cameraMonitoring: Boolean(data.cameraMonitoring),
      cameraMonitoringMode: data.cameraMonitoringMode || 'photo',
      cameraMonitoringInterval: Number(data.cameraMonitoringInterval) || 30,
    };

    // Validate with zod schema to ensure type safety
    return interviewConfigSchema.parse(cleanObject);
  };

  const onSubmit = async (data: InterviewConfig) => {
    try {
      const cleanData = createCleanData(data);
      await onComplete(cleanData, true);
    } catch (error) {
      console.error('Error submitting interview config:', error);
      // Handle error appropriately
    }
  };

  const handleSave = async () => {
    try {
      const isValid = await form.trigger();
      if (!isValid) {
        console.warn('Form validation failed');
        return;
      }

      const formData = form.getValues();
      const cleanData = createCleanData(formData);
      await onComplete(cleanData, false);
    } catch (error) {
      console.error('Error saving interview config:', error);
      // You might want to show a toast notification here
      throw error; // Re-throw to let parent handle it if needed
    }
  };

  const handleSaveAndContinue = async () => {
    try {
      const isValid = await form.trigger();
      if (!isValid) {
        console.warn('Form validation failed');
        return;
      }

      const formData = form.getValues();
      const cleanData = createCleanData(formData);
      await onComplete(cleanData, true);
    } catch (error) {
      console.error('Error saving interview config:', error);
      // You might want to show a toast notification here
      throw error; // Re-throw to let parent handle it if needed
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Interview Configuration</CardTitle>
        <CardDescription>
          Set up interview duration, difficulty level, and monitoring preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Interview Duration */}
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interview Duration *</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number.parseInt(value, 10))}
                    value={field.value?.toString() || '60'}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Difficulty Level */}
            <FormField
              control={form.control}
              name="difficultyLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Difficulty Level *</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {difficultyLevels.map((level) => {
                        const levelInfo = getDifficultyLevelInfo(level.value);
                        const IconComponent = levelInfo.icon;
                        const isSelected = field.value === level.value;

                        return (
                          <Card
                            key={level.value}
                            className={`cursor-pointer transition-all hover:shadow-md ${
                              isSelected
                                ? `bg-gradient-to-r ${levelInfo.bgGradient} border-2 border-current`
                                : 'hover:bg-muted/50 border border-border'
                            }`}
                            onClick={() => field.onChange(level.value)}
                          >
                            <CardContent className="p-3 text-center">
                              <div
                                className={`mx-auto p-2 rounded-full ${levelInfo.colorClass} w-fit mb-2`}
                              >
                                <IconComponent className="h-4 w-4" />
                              </div>
                              <h4 className="font-medium text-sm leading-tight">{level.label}</h4>
                              <p className="text-xs text-muted-foreground mt-1 leading-tight">
                                {level.description}
                              </p>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Interview Instructions */}
            <FormField
              control={form.control}
              name="instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interview Instructions</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide any specific instructions for candidates before they start the interview..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional instructions that will be shown to candidates before the interview
                    starts
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Monitoring System */}
            <div className="space-y-6 pt-4 border-t border-border">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Monitoring System</h3>
                <p className="text-sm text-muted-foreground">
                  Configure how candidates will be monitored during the interview
                </p>
              </div>

              <div className="grid gap-4">
                {/* Screen Monitoring */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                          <Monitor className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <FormLabel className="text-base font-medium">Screen Monitoring</FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Monitor candidate&apos;s screen during the interview
                          </p>
                        </div>
                      </div>
                      <FormField
                        control={form.control}
                        name="screenMonitoring"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    {watchScreenMonitoring && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-border">
                        <FormField
                          control={form.control}
                          name="screenMonitoringMode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mode</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value || 'photo'}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="photo">Photo Capture</SelectItem>
                                  <SelectItem value="video">Video Recording</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="screenMonitoringInterval"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Interval</FormLabel>
                              <Select
                                onValueChange={(value) =>
                                  field.onChange(Number.parseInt(value, 10))
                                }
                                value={field.value?.toString() || '30'}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="30">30 seconds</SelectItem>
                                  <SelectItem value="60">60 seconds</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Camera Monitoring */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
                          <Camera className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <FormLabel className="text-base font-medium">Camera Monitoring</FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Monitor candidate through their camera
                          </p>
                        </div>
                      </div>
                      <FormField
                        control={form.control}
                        name="cameraMonitoring"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    {watchCameraMonitoring && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-border">
                        <FormField
                          control={form.control}
                          name="cameraMonitoringMode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mode</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value || 'photo'}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="photo">Photo Capture</SelectItem>
                                  <SelectItem value="video">Video Recording</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="cameraMonitoringInterval"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Interval</FormLabel>
                              <Select
                                onValueChange={(value) =>
                                  field.onChange(Number.parseInt(value, 10))
                                }
                                value={field.value?.toString() || '30'}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="30">30 seconds</SelectItem>
                                  <SelectItem value="60">60 seconds</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

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
