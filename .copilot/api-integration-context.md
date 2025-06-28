# API Integration & Patterns Context

## Overview

This document provides comprehensive context about API integration patterns, endpoint structures, and data flow within the Hirelytics platform.

## API Architecture

### Base API Structure

```
/api/
├── auth/                  # Authentication endpoints
│   ├── admin/            # Admin authentication
│   ├── recruiter/        # Recruiter authentication
│   └── candidate/        # Candidate authentication
├── ai/                   # AI-powered features
│   ├── generate-questions/
│   └── generate-description/
├── v1/                   # Versioned API endpoints
│   ├── users/
│   ├── admins/
│   └── recruiters/
└── industries/           # Industry data endpoints
```

## Authentication APIs

### Admin Authentication

```typescript
// POST /api/auth/admin/send-email-otp
interface SendEmailOtpRequest {
  email: string;
}
interface SendEmailOtpResponse {
  success: boolean;
  message: string;
}

// POST /api/auth/admin/verify-email-otp
interface VerifyEmailOtpRequest {
  email: string;
  otp: string;
}
interface VerifyEmailOtpResponse {
  success: boolean;
  message: string;
  token?: string; // Temporary token for 2FA
}

// POST /api/auth/admin/verify-init-otp
interface VerifyInitOtpRequest {
  otp: string;
}
interface VerifyInitOtpResponse {
  success: boolean;
  message: string;
  user?: IUser;
}
```

### Recruiter Authentication

```typescript
// POST /api/auth/recruiter/login
interface RecruiterLoginRequest {
  email: string;
}
interface RecruiterLoginResponse {
  success: boolean;
  message: string;
}

// POST /api/auth/recruiter/verify-otp
interface RecruiterVerifyOtpRequest {
  email: string;
  otp: string;
}
interface RecruiterVerifyOtpResponse {
  success: boolean;
  message: string;
  user?: IUser;
}

// POST /api/auth/recruiter/portal-access-request
interface PortalAccessRequest {
  full_name: string;
  work_email: string;
  company_name: string;
  company_website?: string;
  job_title: string;
  phone_number?: string;
  company_size?: string;
  industry?: string;
  hiring_volume?: string;
  use_case?: string;
  additional_info?: string;
}
```

### Candidate Authentication

```typescript
// POST /api/auth/candidate/signup
interface CandidateSignupRequest {
  name: string;
  email: string;
}
interface CandidateSignupResponse {
  success: boolean;
  message: string;
}

// POST /api/auth/candidate/login
interface CandidateLoginRequest {
  email: string;
}
interface CandidateLoginResponse {
  success: boolean;
  message: string;
}

// POST /api/auth/candidate/verify-otp
interface CandidateVerifyOtpRequest {
  email: string;
  otp: string;
}
interface CandidateVerifyOtpResponse {
  success: boolean;
  message: string;
  user?: IUser;
}
```

## AI Integration APIs

### Question Generation

```typescript
// POST /api/ai/generate-questions
interface GenerateQuestionsRequest {
  questionType: string; // 'technical-coding', 'behavioral', etc.
  numberOfQuestions: number;
  industry: string;
  difficultyLevel: 'easy' | 'normal' | 'hard' | 'expert' | 'advanced';
  jobTitle: string;
}

interface GenerateQuestionsResponse {
  success: boolean;
  data: IQuestion[];
  error?: string;
}

interface IQuestion {
  id: string;
  type: string;
  question: string;
  isAIGenerated: boolean;
}

// Question Generation Logic:
// 1. Select appropriate question templates based on type and industry
// 2. Generate questions with contextual placeholders
// 3. Replace placeholders with industry-specific content
// 4. Return structured question objects
```

### Description Generation

```typescript
// POST /api/ai/generate-description
interface GenerateDescriptionRequest {
  title: string;
  industry: string;
  skills: string[];
  location: string;
}

interface GenerateDescriptionResponse {
  success: boolean;
  data: {
    description: string;
    requirements: string;
    benefits: string;
  };
  error?: string;
}

// Description Generation Logic:
// 1. Create job description based on title and industry
// 2. Generate requirements using skills and experience levels
// 3. Create benefits package based on industry standards
// 4. Return formatted content for job posting
```

## Core API Endpoints

### User Management

```typescript
// GET /api/v1/users/[id]
interface GetUserResponse {
  success: boolean;
  data: IUser;
  message?: string;
}

// PUT /api/v1/users/[id]
interface UpdateUserRequest {
  name?: string;
  profilePicture?: string;
  // Other updatable fields
}

// DELETE /api/v1/users/[id]
interface DeleteUserResponse {
  success: boolean;
  message: string;
}
```

### Admin Management

```typescript
// GET /api/v1/admins
interface GetAdminsRequest {
  page?: number;
  limit?: number;
  search?: string;
}

interface GetAdminsResponse {
  success: boolean;
  data: IUser[];
  totalCount: number;
}
```

### Recruiter Management

```typescript
// GET /api/v1/recruiters
interface GetRecruitersRequest {
  page?: number;
  limit?: number;
  search?: string;
}

interface GetRecruitersResponse {
  success: boolean;
  data: IUser[];
  totalCount: number;
}
```

## API Integration Patterns

### Request/Response Pattern

```typescript
// Standard API Response Format
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ZodError[];
  totalCount?: number; // For paginated responses
}

// Error Response Format
interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Array<{
    path: string[];
    message: string;
    code: string;
  }>;
}
```

### Authentication Integration

```typescript
// JWT Token Structure
interface JWTPayload {
  userId: string;
  email: string;
  role: 'admin' | 'recruiter' | 'user';
  iat: number;
  exp: number;
}

// Cookie Configuration
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  path: '/',
};
```

### Database Connection Pattern

```typescript
// MongoDB Connection Handling
export async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    await mongoose.connect(process.env.DATABASE_URL!);
    console.log('MongoDB connected successfully');
    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw new Error('Database connection failed');
  }
}
```

### Pagination Pattern

```typescript
// Pagination Helper
export function parsePaginationParams(searchParams: URLSearchParams) {
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

// Paginated Data Fetching
export async function paginatedData<T>(
  Model: mongoose.Model<T>,
  limit: number,
  skip: number,
  filter: any = {},
  select?: string
) {
  const [totalCount, data] = await Promise.all([
    Model.countDocuments(filter),
    Model.find(filter).select(select).limit(limit).skip(skip).sort({ createdAt: -1 }),
  ]);

  return [totalCount, data];
}
```

## API Security Patterns

### Input Validation

```typescript
// Zod Schema Validation Pattern
export async function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Promise<{ success: true; data: T } | { success: false; errors: ZodError }> {
  const result = schema.safeParse(data);

  if (!result.success) {
    return { success: false, errors: result.error };
  }

  return { success: true, data: result.data };
}
```

### Rate Limiting Pattern

```typescript
// Rate limiting middleware (conceptual)
interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
}

// Example: OTP rate limiting
const otpRateLimit: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 3, // 3 OTP requests per minute
};
```

### Error Handling Pattern

```typescript
// Centralized Error Handler
export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error);

  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        success: false,
        message: 'Validation failed',
        errors: error.errors,
      },
      { status: 400 }
    );
  }

  if (error instanceof mongoose.Error.ValidationError) {
    return NextResponse.json(
      {
        success: false,
        message: 'Database validation failed',
        errors: Object.values(error.errors).map((e) => e.message),
      },
      { status: 400 }
    );
  }

  return NextResponse.json(
    {
      success: false,
      message: 'Internal server error',
    },
    { status: 500 }
  );
}
```

## Client-Side Integration

### TanStack Query Integration

```typescript
// Query Key Factory
export const jobQueries = {
  all: ['jobs'] as const,
  lists: () => [...jobQueries.all, 'list'] as const,
  list: (filters: JobFilters) => [...jobQueries.lists(), filters] as const,
  details: () => [...jobQueries.all, 'detail'] as const,
  detail: (id: string) => [...jobQueries.details(), id] as const,
};

// API Client
export const jobApi = {
  getJobs: async (filters: JobFilters): Promise<JobListResponse> => {
    const params = new URLSearchParams(filters);
    const response = await fetch(`/api/v1/jobs?${params}`);
    return response.json();
  },

  createJob: async (data: CreateJobRequest): Promise<JobResponse> => {
    const response = await fetch('/api/v1/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};
```

### Mutation Patterns

```typescript
// Optimistic Update Mutation
export function useCreateJobMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: jobApi.createJob,
    onMutate: async (newJob) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: jobQueries.lists() });

      // Snapshot previous value
      const previousJobs = queryClient.getQueryData(jobQueries.lists());

      // Optimistically update
      queryClient.setQueryData(jobQueries.lists(), (old: Job[]) => [
        ...old,
        { ...newJob, id: 'temp-id', status: 'draft' },
      ]);

      return { previousJobs };
    },
    onError: (err, newJob, context) => {
      // Rollback on error
      queryClient.setQueryData(jobQueries.lists(), context?.previousJobs);
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: jobQueries.lists() });
    },
  });
}
```

This API integration context provides comprehensive patterns and examples for working with the Hirelytics API ecosystem.
