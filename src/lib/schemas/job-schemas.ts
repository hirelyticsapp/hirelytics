import { Types } from 'mongoose';
import { z } from 'zod';

const objectIdSchema = z.string().refine(
  (val) => {
    return Types.ObjectId.isValid(val);
  },
  {
    message: 'Invalid ObjectId format',
  }
);

// Step 1: Basic Details Schema (for popup)
export const basicJobDetailsSchema = z.object({
  title: z
    .string()
    .min(1, 'Job title is required')
    .max(100, 'Title cannot be more than 100 characters'),
  organizationId: objectIdSchema,
  industry: z.string().min(1, 'Industry is required'),
  salary: z.string().optional(),
  currency: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
  expiryDate: z.date({
    required_error: 'Expiry date is required',
  }),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
  status: z.enum(['draft', 'published', 'expired', 'deleted']),
});

// Step 2: Description & Details Schema
export const jobDescriptionSchema = z.object({
  description: z.string().min(1, 'Job description is required'),
  requirements: z.string().optional(),
  benefits: z.string().optional(),
});

// Step 3: Interview Configuration Schema
export const interviewConfigSchema = z.object({
  duration: z
    .number()
    .min(5, 'Interview duration must be at least 5 minutes')
    .max(120, 'Interview duration cannot exceed 120 minutes'),
  instructions: z.string().optional(),
  difficultyLevel: z.enum(['easy', 'normal', 'hard', 'expert', 'advanced']),
  screenMonitoring: z.boolean(),
  screenMonitoringMode: z.enum(['photo', 'video']),
  screenMonitoringInterval: z.number().optional(),
  cameraMonitoring: z.boolean(),
  cameraMonitoringMode: z.enum(['photo', 'video']),
  cameraMonitoringInterval: z.number().optional(),
});

// Question schemas
export const questionSchema = z.object({
  id: z.string(),
  type: z.string(),
  question: z.string().min(1, 'Question is required'),
  isAIGenerated: z.boolean().optional(),
});

export const questionCategoryConfigSchema = z.object({
  type: z.string(),
  numberOfQuestions: z
    .number()
    .min(1, 'At least 1 question required per category')
    .max(20, 'Maximum 20 questions per category'),
});

// Step 4: Questions Configuration Schema
export const questionsConfigSchema = z.object({
  mode: z.enum(['manual', 'ai-mode']),
  totalQuestions: z
    .number()
    .min(1, 'At least 1 question required')
    .max(50, 'Maximum 50 questions allowed'),
  categoryConfigs: z
    .array(questionCategoryConfigSchema)
    .min(1, 'At least one category configuration is required'),
  questionTypes: z.array(z.string()).min(1, 'At least one question type is required'),
  questions: z.array(questionSchema).optional(),
});

// Complete job schema (for final validation)
export const completeJobSchema = z.object({
  ...basicJobDetailsSchema.shape,
  ...jobDescriptionSchema.shape,
  interviewConfig: interviewConfigSchema,
  questionsConfig: questionsConfigSchema,
});

// Job step completion tracking
export const jobStepCompletionSchema = z.object({
  basicDetails: z.boolean().default(false),
  description: z.boolean().default(false),
  interviewConfig: z.boolean().default(false),
  questionsConfig: z.boolean().default(false),
  review: z.boolean().default(false),
});

export type BasicJobDetails = z.infer<typeof basicJobDetailsSchema>;
export type JobDescription = z.infer<typeof jobDescriptionSchema>;
export type InterviewConfig = z.infer<typeof interviewConfigSchema>;
export type QuestionsConfig = z.infer<typeof questionsConfigSchema>;
export type CompleteJob = z.infer<typeof completeJobSchema>;
export type JobStepCompletion = z.infer<typeof jobStepCompletionSchema>;
