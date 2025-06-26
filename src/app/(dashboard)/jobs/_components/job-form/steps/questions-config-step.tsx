'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Bot,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  Save,
  Sparkles,
  Trash2,
  User,
} from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
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
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { industriesData } from '@/lib/constants/industry-data';
import { questionModes } from '@/lib/constants/job-constants';
import { type QuestionsConfig, questionsConfigSchema } from '@/lib/schemas/job-schemas';
import { calculateTotalQuestions } from '@/lib/utils/job-utils';

interface QuestionsConfigStepProps {
  initialData?: Partial<QuestionsConfig>;
  industry: string;
  jobTitle?: string;
  difficultyLevel?: string;
  onComplete: (data: QuestionsConfig) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function QuestionsConfigStep({
  initialData,
  industry,
  jobTitle,
  difficultyLevel,
  onComplete,
  onNext,
  onPrevious,
}: QuestionsConfigStepProps) {
  const [selectedQuestionTypes, setSelectedQuestionTypes] = useState<string[]>(
    initialData?.questionTypes || []
  );
  const [manualQuestions, setManualQuestions] = useState<Record<string, any[]>>(
    initialData?.questions?.reduce(
      (acc, q) => {
        if (!acc[q.type]) acc[q.type] = [];
        acc[q.type].push(q);
        return acc;
      },
      {} as Record<string, any[]>
    ) || {}
  );
  const [generatingQuestions, setGeneratingQuestions] = useState<Record<string, boolean>>({});

  const form = useForm<QuestionsConfig>({
    resolver: zodResolver(questionsConfigSchema),
    defaultValues: {
      mode: initialData?.mode || 'ai-mode',
      categoryConfigs: initialData?.categoryConfigs || [],
      questionTypes: initialData?.questionTypes || [],
      questions: initialData?.questions || [],
    },
  });

  const watchMode = form.watch('mode');

  const availableQuestionTypes =
    industriesData[industry as keyof typeof industriesData]?.questionTypes || [];

  const handleQuestionTypeToggle = (typeValue: string) => {
    const updatedTypes = selectedQuestionTypes.includes(typeValue)
      ? selectedQuestionTypes.filter((t) => t !== typeValue)
      : [...selectedQuestionTypes, typeValue];

    setSelectedQuestionTypes(updatedTypes);
    form.setValue('questionTypes', updatedTypes);

    // Update category configs based on selected types
    const newCategoryConfigs = updatedTypes.map((type) => {
      const questionType = availableQuestionTypes.find((qt) => qt.value === type);
      return {
        type,
        numberOfQuestions: questionType?.defaultQuestions || 3,
      };
    });

    form.setValue('categoryConfigs', newCategoryConfigs);
  };

  const updateCategoryQuestions = (typeValue: string, numberOfQuestions: number) => {
    const currentConfigs = form.getValues('categoryConfigs');
    const updatedConfigs = currentConfigs.map((config) =>
      config.type === typeValue ? { ...config, numberOfQuestions } : config
    );
    form.setValue('categoryConfigs', updatedConfigs);
  };

  const generateQuestionsForType = async (questionType: string, numberOfQuestions: number) => {
    setGeneratingQuestions((prev) => ({ ...prev, [questionType]: true }));

    try {
      const response = await fetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionType,
          numberOfQuestions,
          industry,
          difficultyLevel,
          jobTitle,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setManualQuestions((prev) => ({
          ...prev,
          [questionType]: result.data,
        }));
      }
    } catch (error) {
      console.error('Failed to generate questions:', error);
    } finally {
      setGeneratingQuestions((prev) => ({ ...prev, [questionType]: false }));
    }
  };

  const addManualQuestion = (questionType: string) => {
    const newQuestion = {
      id: `q_${Date.now()}`,
      type: questionType,
      question: '',
      isAIGenerated: false,
    };

    setManualQuestions((prev) => ({
      ...prev,
      [questionType]: [...(prev[questionType] || []), newQuestion],
    }));
  };

  const updateManualQuestion = (questionType: string, questionId: string, questionText: string) => {
    setManualQuestions((prev) => ({
      ...prev,
      [questionType]:
        prev[questionType]?.map((q) =>
          q.id === questionId ? { ...q, question: questionText } : q
        ) || [],
    }));
  };

  const removeManualQuestion = (questionType: string, questionId: string) => {
    setManualQuestions((prev) => ({
      ...prev,
      [questionType]: prev[questionType]?.filter((q) => q.id !== questionId) || [],
    }));
  };

  const onSubmit = (data: QuestionsConfig) => {
    // Compile all manual questions if in manual mode
    if (watchMode === 'manual') {
      const allQuestions = Object.values(manualQuestions).flat();
      data.questions = allQuestions;
    }

    onComplete(data);
    onNext();
  };

  const handleSaveAndContinue = () => {
    form.handleSubmit(onSubmit)();
  };

  const categoryConfigs = form.watch('categoryConfigs');
  const totalQuestions = calculateTotalQuestions(categoryConfigs);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Questions Configuration</CardTitle>
        <CardDescription>
          Configure how questions will be generated and managed for this interview
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Question Mode Selection */}
            <FormField
              control={form.control}
              name="mode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question Generation Mode</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      {questionModes.map((mode) => (
                        <div key={mode.value} className="flex items-center space-x-2">
                          <RadioGroupItem value={mode.value} id={mode.value} />
                          <Label htmlFor={mode.value} className="flex-1 cursor-pointer">
                            <Card
                              className={`p-4 transition-colors ${
                                field.value === mode.value ? 'border-primary bg-primary/5' : ''
                              }`}
                            >
                              <div className="flex items-center gap-3 mb-2">
                                {mode.value === 'ai-mode' ? (
                                  <Bot className="h-5 w-5 text-primary" />
                                ) : (
                                  <User className="h-5 w-5 text-primary" />
                                )}
                                <h3 className="font-medium">{mode.label}</h3>
                              </div>
                              <p className="text-sm text-muted-foreground">{mode.description}</p>
                            </Card>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Question Types Selection */}
            <div className="space-y-4">
              <div>
                <FormLabel>Question Categories</FormLabel>
                <FormDescription>
                  Select the types of questions you want to include in the interview
                </FormDescription>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableQuestionTypes.map((type) => (
                  <Card
                    key={type.value}
                    className={`cursor-pointer transition-colors ${
                      selectedQuestionTypes.includes(type.value)
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handleQuestionTypeToggle(type.value)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{type.label}</h4>
                        {selectedQuestionTypes.includes(type.value) && (
                          <Badge variant="default" className="text-xs">
                            Selected
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {selectedQuestionTypes.length === 0 && (
                <Alert>
                  <AlertDescription>Please select at least one question type</AlertDescription>
                </Alert>
              )}
            </div>

            {/* Category Configuration */}
            {selectedQuestionTypes.length > 0 && (
              <div className="space-y-4">
                <Separator />
                <div>
                  <h3 className="text-lg font-medium">Questions Configuration</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure the number of questions for each selected category
                  </p>
                </div>

                <div className="space-y-4">
                  {selectedQuestionTypes.map((typeValue) => {
                    const type = availableQuestionTypes.find((t) => t.value === typeValue);
                    const config = categoryConfigs.find((c) => c.type === typeValue);
                    const questionsForType = manualQuestions[typeValue] || [];

                    return (
                      <Card key={typeValue}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-base">{type?.label}</CardTitle>
                              <CardDescription>{type?.description}</CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                              <Label htmlFor={`questions-${typeValue}`} className="text-sm">
                                Questions:
                              </Label>
                              <Input
                                id={`questions-${typeValue}`}
                                type="number"
                                min="1"
                                max="20"
                                value={config?.numberOfQuestions || 1}
                                onChange={(e) =>
                                  updateCategoryQuestions(
                                    typeValue,
                                    Number.parseInt(e.target.value)
                                  )
                                }
                                className="w-20"
                              />
                            </div>
                          </div>
                        </CardHeader>

                        {watchMode === 'manual' && (
                          <CardContent>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium">
                                  Manual Questions ({questionsForType.length}/
                                  {config?.numberOfQuestions || 0})
                                </p>
                                <div className="flex gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      generateQuestionsForType(
                                        typeValue,
                                        config?.numberOfQuestions || 3
                                      )
                                    }
                                    disabled={generatingQuestions[typeValue]}
                                    className="gap-2"
                                  >
                                    {generatingQuestions[typeValue] ? (
                                      <>
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                        Generating...
                                      </>
                                    ) : (
                                      <>
                                        <Sparkles className="h-3 w-3" />
                                        AI Generate
                                      </>
                                    )}
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addManualQuestion(typeValue)}
                                  >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Add
                                  </Button>
                                </div>
                              </div>

                              {questionsForType.map((question, index) => (
                                <div key={question.id} className="flex gap-2">
                                  <div className="flex-1">
                                    <Textarea
                                      placeholder={`Enter question ${index + 1}...`}
                                      value={question.question}
                                      onChange={(e) =>
                                        updateManualQuestion(typeValue, question.id, e.target.value)
                                      }
                                      className="min-h-[60px]"
                                    />
                                  </div>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeManualQuestion(typeValue, question.id)}
                                    className="mt-1"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}

                              {questionsForType.length < (config?.numberOfQuestions || 0) && (
                                <Alert>
                                  <AlertDescription>
                                    Add {(config?.numberOfQuestions || 0) - questionsForType.length}{' '}
                                    more question(s) to complete this category
                                  </AlertDescription>
                                </Alert>
                              )}
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium">Total Questions:</span>
                  <Badge variant="default" className="text-base px-3 py-1">
                    {totalQuestions}
                  </Badge>
                </div>
              </div>
            )}

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
                <Button type="submit" disabled={selectedQuestionTypes.length === 0}>
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
