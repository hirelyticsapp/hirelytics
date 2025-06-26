'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Camera, ChevronLeft, ChevronRight, Monitor, Save } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
  onComplete: (data: InterviewConfig) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function InterviewConfigStep({
  initialData,
  onComplete,
  onNext,
  onPrevious,
}: InterviewConfigStepProps) {
  const form = useForm<InterviewConfig>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(interviewConfigSchema) as any,
    defaultValues: {
      duration: initialData?.duration || 60,
      instructions: initialData?.instructions || '',
      difficultyLevel: initialData?.difficultyLevel || 'normal',
      screenMonitoring: initialData?.screenMonitoring || false,
      screenMonitoringMode: initialData?.screenMonitoringMode || 'photo',
      screenMonitoringInterval: initialData?.screenMonitoringInterval || 30,
      cameraMonitoring: initialData?.cameraMonitoring || false,
      cameraMonitoringMode: initialData?.cameraMonitoringMode || 'photo',
      cameraMonitoringInterval: initialData?.cameraMonitoringInterval || 30,
    },
  });

  const watchScreenMonitoring = form.watch('screenMonitoring');
  const watchCameraMonitoring = form.watch('cameraMonitoring');

  const onSubmit = (data: InterviewConfig) => {
    onComplete(data);
    onNext();
  };

  const handleSaveAndContinue = () => {
    form.handleSubmit(onSubmit)();
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interview Duration (minutes) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="5"
                        max="120"
                        {...field}
                        onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>Duration between 5-120 minutes</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="difficultyLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty Level *</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="space-y-3"
                      >
                        {difficultyLevels.map((level) => {
                          const levelInfo = getDifficultyLevelInfo(level.value);
                          const IconComponent = levelInfo.icon;

                          return (
                            <div key={level.value} className="flex items-center space-x-2">
                              <RadioGroupItem value={level.value} id={level.value} />
                              <Label htmlFor={level.value} className="flex-1 cursor-pointer">
                                <Card
                                  className={`p-4 transition-all hover:shadow-md ${
                                    field.value === level.value
                                      ? `bg-gradient-to-r ${levelInfo.bgGradient} border-2 ${levelInfo.colorClass.split(' ')[2]}`
                                      : 'hover:bg-muted/50'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${levelInfo.colorClass}`}>
                                      <IconComponent className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1">
                                      <h4 className="font-medium">{level.label}</h4>
                                      <p className="text-sm text-muted-foreground">
                                        {level.description}
                                      </p>
                                    </div>
                                  </div>
                                </Card>
                              </Label>
                            </div>
                          );
                        })}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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

            {/* Monitoring Settings */}
            <div className="space-y-6">
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Monitoring Settings</h3>

                {/* Screen Monitoring */}
                <Card className="mb-4">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Monitor className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <FormLabel>Screen Monitoring</FormLabel>
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <FormField
                          control={form.control}
                          name="screenMonitoringMode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mode</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                                onValueChange={(value) => field.onChange(Number.parseInt(value))}
                                defaultValue={field.value?.toString()}
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
                        <Camera className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <FormLabel>Camera Monitoring</FormLabel>
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <FormField
                          control={form.control}
                          name="cameraMonitoringMode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mode</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                                onValueChange={(value) => field.onChange(Number.parseInt(value))}
                                defaultValue={field.value?.toString()}
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
                <Button type="button" variant="outline" onClick={handleSaveAndContinue}>
                  <Save className="h-4 w-4 mr-2" />
                  Save & Continue
                </Button>
                <Button type="submit">
                  Next Step
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
