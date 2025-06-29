'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  Bot,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Minus,
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
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useGenerateInterviewQuestionsMutation } from '@/hooks/use-job-queries';
import { industriesData } from '@/lib/constants/industry-data';
import { questionModes } from '@/lib/constants/job-constants';
import { type QuestionsConfig, questionsConfigSchema } from '@/lib/schemas/job-schemas';

// Define the question type locally
type GeneratedQuestion = {
  id: string;
  type: string;
  question: string;
  isAIGenerated: boolean;
};
import { calculateTotalQuestions } from '@/lib/utils/job-utils';

interface QuestionsConfigStepProps {
  initialData?: Partial<QuestionsConfig>;
  industry: string;
  jobTitle?: string;
  difficultyLevel?: string;
  organizationName?: string;
  onComplete: (data: QuestionsConfig, shouldMoveNext?: boolean) => Promise<void>;
  onPrevious: () => void;
  isSaving?: boolean;
}

export function QuestionsConfigStep({
  initialData,
  industry,
  jobTitle,
  difficultyLevel,
  organizationName,
  onComplete,
  onPrevious,
  isSaving = false,
}: QuestionsConfigStepProps) {
  const [selectedQuestionTypes, setSelectedQuestionTypes] = useState<string[]>(
    initialData?.questionTypes || []
  );
  const [manualQuestions, setManualQuestions] = useState<Record<string, GeneratedQuestion[]>>(
    // Convert existing questions to GeneratedQuestion format
    initialData?.questions?.reduce((acc: Record<string, GeneratedQuestion[]>, q) => {
      if (!acc[q.type]) acc[q.type] = [];
      acc[q.type].push(q as GeneratedQuestion);
      return acc;
    }, {}) || {}
  );
  const [generatingQuestions, setGeneratingQuestions] = useState<Record<string, boolean>>({});

  const generateInterviewQuestionsMutation = useGenerateInterviewQuestionsMutation();

  const form = useForm<QuestionsConfig>({
    resolver: zodResolver(questionsConfigSchema),
    defaultValues: {
      mode: initialData?.mode || 'ai-mode',
      categoryConfigs: initialData?.categoryConfigs || [],
      questionTypes: initialData?.questionTypes || [],
      questions: initialData?.questions || [],
      totalQuestions: calculateTotalQuestions(initialData?.categoryConfigs || []),
    },
  });

  const watchMode = form.watch('mode');

  const availableQuestionTypes =
    industriesData[industry as keyof typeof industriesData]?.questionTypes || [];

  // Auto-select first question type if none selected
  useState(() => {
    if (selectedQuestionTypes.length === 0 && availableQuestionTypes.length > 0) {
      const firstType = availableQuestionTypes[0].value;
      setSelectedQuestionTypes([firstType]);
      form.setValue('questionTypes', [firstType]);
      form.setValue('categoryConfigs', [
        {
          type: firstType,
          numberOfQuestions: Math.max(1, availableQuestionTypes[0].defaultQuestions || 3),
        },
      ]);
    }
  });

  const handleQuestionTypeToggle = (typeValue: string) => {
    const updatedTypes = selectedQuestionTypes.includes(typeValue)
      ? selectedQuestionTypes.filter((t) => t !== typeValue)
      : [...selectedQuestionTypes, typeValue];

    // Ensure at least one type is selected
    if (updatedTypes.length === 0) {
      return;
    }

    setSelectedQuestionTypes(updatedTypes);
    form.setValue('questionTypes', updatedTypes);

    // Update category configs based on selected types
    const newCategoryConfigs = updatedTypes.map((type) => {
      const questionType = availableQuestionTypes.find((qt) => qt.value === type);
      const existingConfig = form
        .getValues('categoryConfigs')
        .find((config) => config.type === type);
      return {
        type,
        numberOfQuestions: Math.max(
          1,
          existingConfig?.numberOfQuestions || questionType?.defaultQuestions || 3
        ),
      };
    });

    form.setValue('categoryConfigs', newCategoryConfigs);

    // Update total questions
    const totalQuestions = calculateTotalQuestions(newCategoryConfigs);
    form.setValue('totalQuestions', totalQuestions);
  };

  const updateCategoryQuestions = (typeValue: string, numberOfQuestions: number) => {
    const validNumber = Math.max(1, Math.min(20, numberOfQuestions));
    const currentConfigs = form.getValues('categoryConfigs');
    const updatedConfigs = currentConfigs.map((config) =>
      config.type === typeValue ? { ...config, numberOfQuestions: validNumber } : config
    );
    form.setValue('categoryConfigs', updatedConfigs);

    // Update total questions
    const totalQuestions = calculateTotalQuestions(updatedConfigs);
    form.setValue('totalQuestions', totalQuestions);
  };

  const generateQuestionsForType = async (questionType: string, numberOfQuestions: number) => {
    setGeneratingQuestions((prev) => ({ ...prev, [questionType]: true }));

    try {
      const result = await generateInterviewQuestionsMutation.mutateAsync({
        industry,
        jobTitle: jobTitle || '',
        difficultyLevel: difficultyLevel || 'normal',
        questionTypes: [questionType],
        totalQuestions: numberOfQuestions,
        organizationName,
      });

      if (result.success) {
        const typedQuestions = result.data.map((q) => ({
          id: q.id,
          type: q.type,
          question: q.question,
          isAIGenerated: q.isAIGenerated ?? true,
        }));

        setManualQuestions((prev) => ({
          ...prev,
          [questionType]: typedQuestions,
        }));
      }
    } catch (error) {
      console.error('Failed to generate questions:', error);
    } finally {
      setGeneratingQuestions((prev) => ({ ...prev, [questionType]: false }));
    }
  };

  const addManualQuestion = (questionType: string) => {
    const currentQuestions = manualQuestions[questionType] || [];
    const categoryConfig = form.getValues('categoryConfigs').find((c) => c.type === questionType);
    const maxQuestions = categoryConfig?.numberOfQuestions || 0;

    // Don't add if we've reached the limit
    if (currentQuestions.length >= maxQuestions) {
      return;
    }

    const newQuestion: GeneratedQuestion = {
      id: `manual_${questionType}_${Date.now()}`,
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

  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (selectedQuestionTypes.length === 0) {
      errors.push('Please select at least one question category');
    }

    const categoryConfigs = form.getValues('categoryConfigs');
    const totalQuestions = calculateTotalQuestions(categoryConfigs);

    if (totalQuestions === 0) {
      errors.push('Total questions must be greater than 0');
    }

    if (totalQuestions > 50) {
      errors.push('Total questions cannot exceed 50');
    }

    if (watchMode === 'manual') {
      for (const config of categoryConfigs) {
        const questionsForType = manualQuestions[config.type] || [];
        const validQuestions = questionsForType.filter((q) => q.question.trim().length > 0);

        if (validQuestions.length < config.numberOfQuestions) {
          errors.push(
            `${availableQuestionTypes.find((t) => t.value === config.type)?.label || config.type}: Need ${config.numberOfQuestions} questions, but only ${validQuestions.length} provided`
          );
        }
      }
    }

    return errors;
  };

  const onSubmit = async (data: QuestionsConfig) => {
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      return;
    }

    // Compile all manual questions if in manual mode
    if (watchMode === 'manual') {
      const allQuestions = Object.values(manualQuestions)
        .flat()
        .filter((q) => q.question.trim().length > 0);
      data.questions = allQuestions;
    }

    await onComplete(data, true); // Save and move to next step
  };

  const handleSave = async () => {
    const formData = form.getValues();
    // Compile all manual questions if in manual mode
    if (watchMode === 'manual') {
      const allQuestions = Object.values(manualQuestions)
        .flat()
        .filter((q) => q.question.trim().length > 0);
      formData.questions = allQuestions;
    }

    const isValid = await form.trigger();
    if (isValid) {
      await onComplete(formData, false); // Save without moving to next step
    }
  };

  const handleSaveAndContinue = async () => {
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      // Show validation errors
      return;
    }

    const formData = form.getValues();
    // Compile all manual questions if in manual mode
    if (watchMode === 'manual') {
      const allQuestions = Object.values(manualQuestions)
        .flat()
        .filter((q) => q.question.trim().length > 0);
      formData.questions = allQuestions;
    }

    const isValid = await form.trigger();
    if (isValid) {
      await onComplete(formData, true); // Save and move to next step
    }
  };

  const categoryConfigs = form.watch('categoryConfigs');
  const totalQuestions = calculateTotalQuestions(categoryConfigs);
  const validationErrors = validateForm();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Questions Configuration
          </CardTitle>
          <CardDescription>
            Configure how questions will be generated and managed for this interview. Choose between
            AI-generated questions or manually create your own.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Validation Errors Display */}
              {validationErrors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      {validationErrors.map((error, index) => (
                        <div key={index} className="text-sm">
                          {error}
                        </div>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Question Mode Selection */}
              <FormField
                control={form.control}
                name="mode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">
                      Question Generation Mode
                    </FormLabel>
                    <FormDescription>
                      Choose how you want to create and manage questions for this interview
                    </FormDescription>
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
                                className={`p-4 transition-all duration-200 hover:shadow-md ${
                                  field.value === mode.value
                                    ? 'border-primary bg-primary/5 shadow-sm'
                                    : 'hover:bg-muted/50'
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

              {/* Question Types Selection with Controls */}
              <div className="space-y-4">
                <div>
                  <FormLabel className="text-base font-semibold">Question Categories</FormLabel>
                  <FormDescription>
                    Select the types of questions and configure the number of questions for each
                    category.
                  </FormDescription>
                </div>

                <div className="space-y-3">
                  {availableQuestionTypes.map((type) => {
                    const isSelected = selectedQuestionTypes.includes(type.value);
                    const config = categoryConfigs.find((c) => c.type === type.value);
                    const currentCount = config?.numberOfQuestions || 0;

                    return (
                      <Card
                        key={type.value}
                        className={`transition-all duration-200 ${
                          isSelected
                            ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20'
                            : 'hover:bg-muted/50 hover:shadow-sm'
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleQuestionTypeToggle(type.value)}
                                  className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
                                />
                                <div>
                                  <h4 className="font-medium text-sm">{type.label}</h4>
                                  <p className="text-xs text-muted-foreground">
                                    {type.description}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {isSelected && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Questions:</span>
                                <div className="flex items-center gap-1">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      updateCategoryQuestions(
                                        type.value,
                                        Math.max(1, currentCount - 1)
                                      )
                                    }
                                    disabled={currentCount <= 1}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="w-8 text-center text-sm font-medium">
                                    {currentCount}
                                  </span>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      updateCategoryQuestions(
                                        type.value,
                                        Math.min(20, currentCount + 1)
                                      )
                                    }
                                    disabled={currentCount >= 20}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {selectedQuestionTypes.length === 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Please select at least one question category to proceed
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Manual Questions Section - Only for manual mode */}
              {selectedQuestionTypes.length > 0 && watchMode === 'manual' && (
                <div className="space-y-4">
                  <Separator />
                  <div>
                    <h3 className="text-lg font-medium">Manual Questions</h3>
                    <p className="text-sm text-muted-foreground">
                      Add questions for each selected category. You can add up to the configured
                      number of questions for each type.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {selectedQuestionTypes.map((typeValue) => {
                      const type = availableQuestionTypes.find((t) => t.value === typeValue);
                      const config = categoryConfigs.find((c) => c.type === typeValue);
                      const questionsForType = manualQuestions[typeValue] || [];
                      const maxQuestions = config?.numberOfQuestions || 0;
                      const canAddMore = questionsForType.length < maxQuestions;

                      return (
                        <Card key={typeValue}>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle className="text-base">{type?.label}</CardTitle>
                                <CardDescription>
                                  {questionsForType.length}/{maxQuestions} questions added
                                </CardDescription>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => generateQuestionsForType(typeValue, maxQuestions)}
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
                                  disabled={!canAddMore}
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add Question
                                </Button>
                              </div>
                            </div>
                          </CardHeader>

                          <CardContent className="space-y-3">
                            {questionsForType.length === 0 ? (
                              <div className="text-center py-6 text-muted-foreground">
                                <p className="text-sm">No questions added yet.</p>
                                <p className="text-xs">
                                  Click &quot;Add Question&quot; or &quot;AI Generate&quot; to get
                                  started.
                                </p>
                              </div>
                            ) : (
                              questionsForType.map((question, index) => (
                                <div key={question.id} className="flex gap-2">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="text-xs text-muted-foreground">
                                        Question {index + 1}
                                      </span>
                                      {question.isAIGenerated && (
                                        <Badge variant="secondary" className="text-xs">
                                          <Bot className="h-3 w-3 mr-1" />
                                          AI Generated
                                        </Badge>
                                      )}
                                    </div>
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
                                    className="mt-6"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Total Questions Summary */}
              {selectedQuestionTypes.length > 0 && (
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <span className="text-sm font-medium">Total Questions:</span>
                  <Badge variant="default" className="text-base px-3 py-1">
                    {totalQuestions}
                  </Badge>
                </div>
              )}

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
                  <Button
                    type="button"
                    onClick={handleSaveAndContinue}
                    disabled={selectedQuestionTypes.length === 0 || isSaving}
                  >
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
    </div>
  );
}
