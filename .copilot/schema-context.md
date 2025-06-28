# Database Schema & Validation Context

## Overview

This document provides comprehensive context about database schemas, TypeScript interfaces, and validation patterns used throughout the Hirelytics platform.

## Database Schema Architecture

### MongoDB Collections

#### Users Collection (`src/db/schema/user.ts`)

```typescript
interface IUser {
  name: string;
  email: string;
  role: 'admin' | 'recruiter' | 'user';
  emailVerified: boolean;
  profilePicture?: string;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Jobs Collection (`src/db/schema/job.ts`)

```typescript
interface IJob {
  title: string;
  description: string;
  requirements?: string;
  benefits?: string;
  skills: string[];
  location: string;
  industry: string;
  salary?: string;
  currency?: string;
  status: 'draft' | 'published' | 'expired' | 'deleted';
  recruiter: ObjectId;
  organization?: ObjectId;
  interviewConfig: IInterviewConfig;
  questionsConfig: IQuestionConfig;
  expiryDate: Date;
  deletedAt?: Date;
  deletedBy?: string;
}

interface IInterviewConfig {
  duration: number; // minutes (5-120)
  instructions?: string;
  difficultyLevel: 'easy' | 'normal' | 'hard' | 'expert' | 'advanced';
  screenMonitoring: boolean;
  screenMonitoringMode: 'photo' | 'video';
  screenMonitoringInterval?: 30 | 60; // seconds
  cameraMonitoring: boolean;
  cameraMonitoringMode: 'photo' | 'video';
  cameraMonitoringInterval?: 30 | 60; // seconds
}

interface IQuestionConfig {
  mode: 'manual' | 'ai-mode';
  totalQuestions: number;
  categoryConfigs: IQuestionCategoryConfig[];
  questionTypes: string[];
  questions?: IQuestion[];
}
```

#### Job Applications Collection (`src/db/schema/job-application.ts`)

```typescript
interface IJobApplication {
  uuid: string; // Unique public identifier
  jobId: ObjectId;
  userId: ObjectId;
  preferredLanguage: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  monitoringImages: {
    camera: Array<{ s3Key: string; timestamp: Date }>;
    screen: Array<{ s3Key: string; timestamp: Date }>;
  };
  candidate: { email: string; name: string };
  jobDetails: { title: string; description: string; skills: string[] };
  sessionInstruction: IInterviewConfig;
  instructionsForAi: {
    instruction: string;
    difficultyLevel: string;
    questionMode: string;
    totalQuestions: number;
    categoryConfigs: IQuestionCategoryConfig[];
    questions?: IQuestion[];
  };
}
```

#### Organizations Collection (`src/db/schema/organization.ts`)

```typescript
interface IOrganization {
  name: string;
  description?: string;
  website?: string;
  industry?: string;
  logo?: string;
  slug: string;
  createdBy: ObjectId;
  members: Array<{
    userId: ObjectId;
    roles: Array<'owner' | 'member'>;
    joinedAt: Date;
  }>;
  deleted: boolean;
}
```

#### OTP Collection (`src/db/schema/otp.ts`)

```typescript
interface IOtp {
  email: string;
  otp: string;
  role?: 'admin' | 'recruiter' | 'user';
  expiresAt: Date;
  createdAt: Date;
}
```

#### Sessions Collection (`src/db/schema/session.ts`)

```typescript
interface ISession {
  userId: ObjectId;
  token: string;
  deviceInfo?: string;
  ipAddress?: string;
  expiresAt: Date;
  createdAt: Date;
}
```

## Validation Schema Patterns

### Zod Schema Structure (`src/lib/schemas/job-schemas.ts`)

#### Form Validation Schemas

```typescript
// Multi-step job creation validation
export const basicJobDetailsSchema = z.object({
  title: z.string().min(1).max(100),
  organizationId: objectIdSchema,
  industry: z.string().min(1),
  salary: z.string().optional(),
  location: z.string().min(1),
  expiryDate: z.date(),
  skills: z.array(z.string()).min(1),
  status: z.enum(['draft', 'published', 'expired', 'deleted']),
});

export const jobDescriptionSchema = z.object({
  description: z.string().min(1),
  requirements: z.string().optional(),
  benefits: z.string().optional(),
});

export const interviewConfigSchema = z.object({
  duration: z.number().min(5).max(120),
  instructions: z.string().optional(),
  difficultyLevel: z.enum(['easy', 'normal', 'hard', 'expert', 'advanced']),
  screenMonitoring: z.boolean(),
  screenMonitoringMode: z.enum(['photo', 'video']),
  screenMonitoringInterval: z.number().optional(),
  cameraMonitoring: z.boolean(),
  cameraMonitoringMode: z.enum(['photo', 'video']),
  cameraMonitoringInterval: z.number().optional(),
});
```

#### Question System Validation

```typescript
export const questionSchema = z.object({
  id: z.string(),
  type: z.string(),
  question: z.string().min(1),
  isAIGenerated: z.boolean().optional(),
});

export const questionCategoryConfigSchema = z.object({
  type: z.string(),
  numberOfQuestions: z.number().min(1),
});

export const questionsConfigSchema = z.object({
  mode: z.enum(['manual', 'ai-mode']),
  totalQuestions: z.number().min(1),
  categoryConfigs: z.array(questionCategoryConfigSchema),
  questionTypes: z.array(z.string()),
  questions: z.array(questionSchema).optional(),
});
```

## Type System Patterns

### Common Type Patterns

- **ObjectId References**: Use `ObjectId` type from mongoose for all database references
- **Enum Types**: Strict string literal unions for status fields
- **Optional Fields**: Use `?` for optional properties, avoid undefined unions
- **Nested Objects**: Separate interfaces for complex nested structures
- **Array Types**: Use `Array<T>` syntax for better readability

### Schema Relationships

```typescript
// User -> Job (recruiter relationship)
job.recruiter: ObjectId // References User._id

// Job -> Organization (optional relationship)
job.organization?: ObjectId // References Organization._id

// JobApplication -> Job (application relationship)
jobApplication.jobId: ObjectId // References Job._id

// JobApplication -> User (candidate relationship)
jobApplication.userId: ObjectId // References User._id

// Organization -> User (membership relationship)
organization.members[].userId: ObjectId // References User._id
```

## Validation Patterns

### API Request Validation

1. **Input Validation**: All API endpoints use Zod schemas for request validation
2. **Error Handling**: Consistent error response format with field-level errors
3. **Type Safety**: Runtime validation ensures TypeScript types match actual data
4. **Sanitization**: Input cleaning and normalization

### Database Validation

1. **Mongoose Schemas**: Database-level validation with custom validators
2. **Unique Constraints**: Email uniqueness, slug uniqueness
3. **Required Fields**: Non-nullable fields enforced at DB level
4. **Default Values**: Sensible defaults for optional fields

### Form Validation

1. **React Hook Form**: Client-side form state management
2. **Zod Resolver**: Seamless integration between Zod and form validation
3. **Real-time Validation**: Field-level validation on blur/change
4. **Error Display**: User-friendly error messages

## Common Schema Utilities

### ObjectId Validation

```typescript
const objectIdSchema = z
  .string()
  .refine((val) => Types.ObjectId.isValid(val), { message: 'Invalid ObjectId format' });
```

### Date Handling

```typescript
// For form inputs
expiryDate: z.date({ required_error: 'Expiry date is required' })

// For API responses
createdAt: { type: Date, default: Date.now }
```

### Enum Validation

```typescript
// Strict type checking
role: z.enum(['admin', 'recruiter', 'user']);
status: z.enum(['draft', 'published', 'expired', 'deleted']);
```

## Best Practices

### Schema Design

- **Consistency**: Use consistent field names across collections
- **Flexibility**: Design for future extensibility
- **Performance**: Index frequently queried fields
- **Relationships**: Use ObjectId references, avoid deep nesting

### Validation Strategy

- **Client-side**: Immediate user feedback
- **Server-side**: Security and data integrity
- **Database-level**: Final data consistency check
- **Type-level**: Compile-time safety with TypeScript

### Error Handling

- **Structured Errors**: Consistent error response format
- **Field-level Errors**: Specific validation messages
- **User-friendly Messages**: Clear, actionable error text
- **Logging**: Detailed error logging for debugging

This schema context provides the foundation for understanding data structures and validation patterns throughout the Hirelytics platform.
