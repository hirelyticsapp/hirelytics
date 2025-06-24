import type { Model } from 'mongoose';
import mongoose, { Schema } from 'mongoose';
import { Document } from 'mongoose';

import { IOrganization } from './organization';
import { IUser } from './user';

export interface IQuestionConfig {
  mode: 'manual' | 'ai-mode'; // manual questions with AI help, or full AI mode
  totalQuestions: number; // Total number of questions across all categories
  categoryConfigs: IQuestionCategoryConfig[]; // Configuration per category
  questionTypes: string[]; // Selected question types (for backward compatibility)
  questions?: IQuestion[]; // For manual mode (optional for ai-mode)
}

export interface IQuestion {
  id: string;
  type: string;
  question: string;
  isAIGenerated?: boolean;
}

export interface IQuestionCategoryConfig {
  type: string; // e.g., 'technical-coding', 'behavioral', etc.
  numberOfQuestions: number; // Number of questions for this specific category
}

export interface IJob extends Document {
  id: string;
  title: string;
  description: string;
  organizationId: mongoose.Types.ObjectId | IOrganization; // Changed to ObjectId reference
  organizationName?: string; // Keep for backward compatibility
  industry: string; // New field
  expiryDate: Date;
  location: string;
  salary?: string;
  currency?: string;
  skills: string[];
  requirements?: string;
  benefits?: string;
  recruiter: mongoose.Types.ObjectId | IUser;
  status: 'draft' | 'published' | 'expired' | 'deleted'; // Added deleted status
  interviewConfig: IInterviewConfig; // New interview configuration object
  questionsConfig: IQuestionConfig; // New unified questions configuration
  deletedAt?: Date; // When the job was deleted
  deletedBy?: string; // Who deleted the job
  createdAt: Date;
  updatedAt: Date;
}

export interface IInterviewConfig {
  duration: number; // Interview duration in minutes
  instructions?: string; // Interview instructions
  difficultyLevel: 'easy' | 'normal' | 'hard' | 'expert' | 'advanced'; // Interview difficulty level
  screenMonitoring: boolean; // Enable screen monitoring
  screenMonitoringMode: 'photo' | 'video'; // Screen monitoring mode
  screenMonitoringInterval?: 30 | 60; // Screen monitoring interval in seconds (if mode is photo/video)
  cameraMonitoring: boolean; // Enable camera monitoring
  cameraMonitoringMode: 'photo' | 'video'; // Camera monitoring mode
  cameraMonitoringInterval?: 30 | 60; // Camera monitoring interval in seconds
}

// Define the schema
// Separate schemas for nested objects
const InterviewConfigSchema = new Schema(
  {
    duration: {
      type: Number,
      required: [true, 'Interview duration is required'],
      min: [5, 'Interview duration must be at least 5 minutes'],
      max: [120, 'Interview duration cannot exceed 120 minutes'],
    },
    instructions: {
      type: String,
    },
    difficultyLevel: {
      type: String,
      enum: ['easy', 'normal', 'hard', 'expert', 'advanced'],
      default: 'normal',
    },
    screenMonitoring: {
      type: Boolean,
      default: false,
    },
    screenMonitoringMode: {
      type: String,
      enum: ['photo', 'video'],
      default: 'photo',
    },
    screenMonitoringInterval: {
      type: Number,
      enum: [30, 60],
      default: 30,
    },
    cameraMonitoring: {
      type: Boolean,
      default: false,
    },
    cameraMonitoringMode: {
      type: String,
      enum: ['photo', 'video'],
      default: 'photo',
    },
    cameraMonitoringInterval: {
      type: Number,
      enum: [30, 60],
      default: 30,
    },
  },
  { _id: false }
);

const QuestionSchema = new Schema(
  {
    id: { type: String, required: true },
    type: { type: String, required: true },
    question: { type: String, required: true },
    isAIGenerated: { type: Boolean, default: false },
  },
  { _id: false }
);

const QuestionCategoryConfigSchema = new Schema(
  {
    type: { type: String, required: true },
    numberOfQuestions: { type: Number, required: true, min: 1, max: 20 },
  },
  { _id: false }
);

const QuestionsConfigSchema = new Schema(
  {
    mode: {
      type: String,
      enum: ['manual', 'ai-mode'],
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
      min: 1,
      max: 50,
    },
    categoryConfigs: {
      type: [QuestionCategoryConfigSchema],
      required: true,
    },
    questionTypes: {
      type: [String],
      required: true,
    },
    questions: {
      type: [QuestionSchema],
      required: false, // Only required for manual mode, optional for ai-mode
    },
  },
  { _id: false }
);

// Main Job schema
const JobSchema = new Schema<IJob>(
  {
    title: {
      type: String,
      required: [true, 'Please provide a job title'],
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a job description'],
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Please provide an organization ID'],
    },
    organizationName: {
      type: String,
      maxlength: [100, 'Organization name cannot be more than 100 characters'],
    },
    industry: {
      type: String,
      required: [true, 'Please provide an industry'],
    },
    expiryDate: {
      type: Date,
      required: [true, 'Please provide an expiry date'],
    },
    location: {
      type: String,
      required: [true, 'Please provide a location'],
    },
    salary: {
      type: String,
    },
    currency: {
      type: String,
    },
    skills: {
      type: [String],
      required: [true, 'Please provide at least one skill'],
    },
    requirements: {
      type: String,
    },
    benefits: {
      type: String,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'expired', 'deleted'],
      default: 'draft',
    },
    recruiter: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    interviewConfig: {
      type: InterviewConfigSchema,
      required: true,
    },
    questionsConfig: {
      type: QuestionsConfigSchema,
      required: true,
    },
    deletedAt: {
      type: Date,
      required: false,
    },
    deletedBy: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
    collection: 'job',
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

const Job: Model<IJob> = mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema);

export default Job;
