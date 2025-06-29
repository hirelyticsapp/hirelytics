import type { Document, Model, ObjectId } from 'mongoose';
import mongoose, { Schema } from 'mongoose';

interface MonitoringEntry {
  s3Key: string;
  timestamp: Date;
  type?: 'image' | 'video';
  duration?: number; // For videos, duration in seconds
}

interface MonitoringImage {
  camera: MonitoringEntry[];
  screen: MonitoringEntry[];
}

export interface IQuestion {
  id: string;
  type: string;
  question: string;
  isAIGenerated?: boolean;
}

export interface IInterviewConversation {
  messageId: string;
  type: 'ai' | 'user';
  content: string;
  timestamp: Date;
  phase?: string;
  questionIndex?: number;
}

export interface IQuestionCategoryConfig {
  type: string; // e.g., 'technical-coding', 'behavioral', etc.
  numberOfQuestions: number; // Number of questions for this specific category
}

export interface IJobApplication extends Document {
  uuid: string; // Unique identifier for the application
  jobId: ObjectId; // Job ID reference as ObjectId
  userId: ObjectId; // User ID reference as ObjectId
  preferredLanguage: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  monitoringImages?: MonitoringImage;
  interviewConversation?: IInterviewConversation[]; // Store all AI questions and user answers
  candidate: {
    email: string; // Email of the candidate
    name: string; // Name of the candidate
  };
  jobDetails: {
    title: string;
    description: string;
    skills: string[];
    benefits?: string;
    requirements?: string;
  };
  sessionInstruction: {
    screenMonitoring: boolean; // Enable screen monitoring
    screenMonitoringMode: 'photo' | 'video'; // Screen monitoring mode
    screenMonitoringInterval?: 30 | 60; // Screen monitoring interval in seconds (if mode is photo/video)
    cameraMonitoring: boolean; // Enable camera monitoring
    cameraMonitoringMode: 'photo' | 'video'; // Camera monitoring mode
    cameraMonitoringInterval?: 30 | 60; // Camera monitoring interval in seconds
    duration: number; // Interview duration in minutes (mandatory)
  };
  instructionsForAi: {
    instruction: string; // Instructions for AI related to the job invitation
    difficultyLevel: 'easy' | 'normal' | 'hard' | 'expert' | 'advanced'; // Interview difficulty level
    questionMode: 'manual' | 'ai-mode';
    totalQuestions: number; // Total number of questions across all categories
    categoryConfigs: IQuestionCategoryConfig[];
    questions?: IQuestion[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const JobApplicationSchema = new Schema<IJobApplication>(
  {
    uuid: { type: String, required: true, unique: true },
    jobId: { type: Schema.Types.ObjectId, ref: 'Job' },
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    preferredLanguage: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'accepted', 'rejected'],
      default: 'pending',
    },
    monitoringImages: {
      camera: [
        {
          s3Key: { type: String, required: true },
          timestamp: { type: Date, required: true },
          type: { type: String, enum: ['image', 'video'], default: 'image' },
          duration: { type: Number }, // For videos, duration in seconds
        },
      ],
      screen: [
        {
          s3Key: { type: String, required: true },
          timestamp: { type: Date, required: true },
          type: { type: String, enum: ['image', 'video'], default: 'image' },
          duration: { type: Number }, // For videos, duration in seconds
        },
      ],
    },
    interviewConversation: [
      {
        messageId: { type: String, required: true },
        type: { type: String, enum: ['ai', 'user'], required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, required: true },
        phase: { type: String },
        questionIndex: { type: Number },
      },
    ],
    candidate: {
      email: { type: String, required: true },
      name: { type: String, required: true },
    },
    jobDetails: {
      title: { type: String, required: true },
      description: { type: String, required: true },
      skills: [{ type: String }],
      benefits: { type: String },
      requirements: { type: String },
    },
    sessionInstruction: {
      screenMonitoring: { type: Boolean, required: true },
      screenMonitoringMode: {
        type: String,
        enum: ['photo', 'video'],
        required: true,
      },
      screenMonitoringInterval: {
        type: Number,
        enum: [30, 60],
      },
      cameraMonitoring: { type: Boolean, required: true },
      cameraMonitoringMode: {
        type: String,
        enum: ['photo', 'video'],
        required: true,
      },
      cameraMonitoringInterval: {
        type: Number,
        enum: [30, 60],
      },
      duration: {
        type: Number,
        required: true,
        min: 5,
        max: 180, // Maximum 3 hours
      },
    },
    instructionsForAi: {
      instruction: { type: String, required: true },
      difficultyLevel: {
        type: String,
        enum: ['easy', 'normal', 'hard', 'expert', 'advanced'],
        required: true,
      },
      questionMode: {
        type: String,
        enum: ['manual', 'ai-mode'],
        required: true,
      },
      totalQuestions: { type: Number, required: true },
      categoryConfigs: [
        {
          type: { type: String, required: true },
          numberOfQuestions: { type: Number, required: true },
        },
      ],
      questions: [
        {
          id: { type: String, required: true },
          type: { type: String, required: true },
          question: { type: String, required: true },
          isAIGenerated: { type: Boolean },
        },
      ],
    },
  },
  {
    timestamps: true,
    collection: 'jobApplication',
    toJSON: {
      virtuals: true,
      transform: function (_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: function (_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

const JobApplication: Model<IJobApplication> =
  mongoose.models.JobApplication ||
  mongoose.model<IJobApplication>('JobApplication', JobApplicationSchema);

export default JobApplication;
