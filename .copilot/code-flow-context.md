# Code Flow & Architecture Context

## Overview

This document outlines the key code flows, architectural patterns, and execution paths throughout the Hirelytics platform.

## Authentication Flow

### User Registration & Login Flow

```
1. User Registration (Candidates)
   └── POST /api/auth/candidate/signup
       ├── Validate input (name, email)
       ├── Check if email exists
       ├── Create user record (emailVerified: false)
       ├── Generate 6-digit OTP
       ├── Store OTP in database
       └── Send OTP via email

2. OTP Verification
   └── POST /api/auth/candidate/verify-otp
       ├── Validate OTP format
       ├── Check OTP exists and not expired
       ├── Mark user as verified
       ├── Generate JWT token
       ├── Set secure HTTP cookie
       └── Return user session

3. Login Flow (Existing Users)
   └── POST /api/auth/candidate/login
       ├── Validate email format
       ├── Check user exists and verified
       ├── Generate new OTP
       ├── Store OTP in database
       └── Send login OTP
```

### Admin Authentication Flow

```
1. Initial OTP Request
   └── POST /api/auth/admin/send-email-otp
       ├── Validate admin email
       ├── Generate email OTP
       └── Send to admin email

2. Email OTP Verification
   └── POST /api/auth/admin/verify-email-otp
       ├── Validate email OTP
       ├── Generate init OTP for 2FA
       └── Return temporary token

3. 2FA Verification
   └── POST /api/auth/admin/verify-init-otp
       ├── Validate 2FA OTP
       ├── Create admin session
       └── Return authenticated token
```

### Recruiter Authentication Flow

```
1. Portal Access Request
   └── POST /api/auth/recruiter/portal-access-request
       ├── Validate business information
       ├── Check if request already exists
       ├── Create portal access request
       └── Notify admin for approval

2. Login (After Approval)
   └── POST /api/auth/recruiter/login
       ├── Validate email
       ├── Check recruiter status
       ├── Generate OTP
       └── Send login OTP
```

## Job Management Flow

### Job Creation Workflow

```
1. Basic Job Details
   └── Component: BasicDetailsStep
       ├── Form: title, organization, industry, location, skills
       ├── Validation: basicJobDetailsSchema
       ├── Action: useUpdateJobBasicDetailsMutation
       └── Database: Update job document

2. Job Description
   └── Component: JobDescriptionStep
       ├── Form: description, requirements, benefits
       ├── AI Generation: /api/ai/generate-description
       ├── Validation: jobDescriptionSchema
       ├── Action: useUpdateJobDescriptionMutation
       └── Database: Update job document

3. Interview Configuration
   └── Component: InterviewConfigStep
       ├── Form: duration, difficulty, monitoring settings
       ├── Validation: interviewConfigSchema
       ├── Action: useUpdateJobInterviewConfigMutation
       └── Database: Update job.interviewConfig

4. Questions Configuration
   └── Component: QuestionsConfigStep
       ├── Form: question mode, categories, manual questions
       ├── AI Generation: /api/ai/generate-questions
       ├── Validation: questionsConfigSchema
       ├── Action: useUpdateJobQuestionsConfigMutation
       └── Database: Update job.questionsConfig

5. Review & Publish
   └── Component: JobDetailsPage
       ├── Validation: Complete job validation
       ├── Action: usePublishJobMutation
       └── Database: Update job.status = 'published'
```

### Job State Management

```
Job States: draft → published → expired → deleted

State Transitions:
├── draft → published (recruiter publishes)
├── published → expired (automatic on expiry date)
├── published → deleted (recruiter removes)
└── expired → published (recruiter extends)
```

## Interview System Flow

### Pre-Interview Flow

```
1. Interview Access
   └── Route: /interview/[uuid]
       ├── Validate interview UUID
       ├── Check interview availability
       ├── Load job and candidate data
       └── Render InterviewClient

2. Device Testing
   └── Component: DeviceCheck
       ├── Camera Test: getUserMedia() for video
       ├── Microphone Test: Record 5-second audio sample
       ├── Device Selection: List available devices
       ├── Permission Handling: Graceful fallback for denied access
       └── Completion: Enable "Start Interview" button
```

### Interview Session Flow

```
1. Session Initialization
   └── Route: /interview/[uuid]/session
       ├── Component: VideoCall
       ├── State: isInterviewStarted = false
       └── Render: InterviewStartScreen

2. Interview Start
   └── InterviewStartScreen.onStartInterview()
       ├── Set: isInterviewStarted = true
       ├── Initialize: Media streams
       ├── Start: Speech recognition
       └── Render: Main interview interface

3. Media Management
   └── Custom Hooks:
       ├── useMediaStream: Camera/microphone control
       ├── useScreenShare: Screen sharing functionality
       ├── useRecording: Video/screen recording
       ├── useSnapshot: Periodic screenshot capture
       └── useSpeechRecognition: Live transcription

4. Interview Monitoring
   └── Monitoring Systems:
       ├── Periodic Snapshots: Every 30 seconds
       ├── Screen Recording: Optional user-initiated
       ├── Camera Recording: Interview session recording
       ├── Speech Transcription: Real-time text conversion
       └── Activity Tracking: Speaking detection simulation
```

### Interview Component Architecture

```
VideoCall (Main Container)
├── InterviewStartScreen (Pre-interview)
├── VideoArea (Video management)
│   ├── UserVideoFeed (Candidate camera)
│   ├── AIVideoFeed (AI assistant representation)
│   └── Screen Share Video (When active)
├── ChatTranscript (Live transcription)
├── MediaControls (Interview controls)
├── TimerDisplay (Session timer)
└── DeviceSelector (Device management modal)
```

## API Request/Response Flow

### Standard API Pattern

```
1. Request Processing
   ├── Route Handler: /api/[endpoint]/route.ts
   ├── Input Validation: Zod schema parsing
   ├── Authentication: JWT token verification
   ├── Database Connection: connectToDatabase()
   ├── Business Logic: Core operation
   ├── Response Formation: Consistent format
   └── Error Handling: Structured error response

2. Response Format
   ├── Success: { success: true, data: T, totalCount?: number }
   ├── Error: { success: false, message: string, errors?: ZodError[] }
   └── Headers: { 'Content-Type': 'application/json' }
```

### Authentication Middleware Pattern

```
1. JWT Verification
   ├── Extract token from cookies/headers
   ├── Verify token signature
   ├── Check token expiration
   ├── Decode user information
   └── Attach user to request context

2. Role-based Access Control
   ├── Check user role
   ├── Validate route permissions
   ├── Allow/deny access
   └── Return appropriate response
```

## State Management Flow

### TanStack Query Pattern

```
1. Query Definition
   └── hooks/use-job-queries.ts
       ├── Query Keys: Hierarchical key structure
       ├── Query Functions: API call abstractions
       ├── Cache Configuration: Stale time, cache time
       ├── Error Handling: Retry logic
       └── Optimistic Updates: UI state management

2. Mutation Pattern
   ├── Mutation Function: API call with side effects
   ├── Optimistic Update: Immediate UI feedback
   ├── Success Handler: Cache invalidation/updates
   ├── Error Handler: Rollback and user notification
   └── Loading States: UI feedback during operations
```

### Form State Management

```
1. React Hook Form Integration
   ├── Form Definition: useForm with Zod resolver
   ├── Field Registration: register() or Controller
   ├── Validation: Real-time and on-submit validation
   ├── Error Display: Field-level error messages
   └── Submission: Mutation trigger with form data

2. Multi-step Form Flow
   ├── Step State: Current step tracking
   ├── Data Persistence: Form data accumulation
   ├── Validation Gates: Step completion requirements
   ├── Navigation: Previous/next step controls
   └── Final Submission: Combined data submission
```

## Error Handling Flow

### Client-side Error Handling

```
1. Form Validation Errors
   ├── Zod Schema Validation
   ├── Field-level Error Display
   ├── Form Submission Blocking
   └── User Guidance Messages

2. API Request Errors
   ├── Network Error Handling
   ├── HTTP Status Code Processing
   ├── Error Message Display (toast)
   ├── Retry Mechanisms
   └── Fallback UI States

3. Component Error Boundaries
   ├── Error Catching at Component Level
   ├── Graceful Degradation
   ├── Error Reporting
   └── Recovery Options
```

### Server-side Error Handling

```
1. Input Validation Errors
   ├── Zod Schema Validation
   ├── Structured Error Response
   ├── Field-specific Error Messages
   └── HTTP 400 Bad Request

2. Authentication Errors
   ├── Token Validation Failure
   ├── Permission Denied
   ├── Session Expiration
   └── HTTP 401/403 Responses

3. Database Errors
   ├── Connection Failures
   ├── Validation Errors
   ├── Duplicate Key Errors
   ├── Error Logging
   └── HTTP 500 Internal Server Error
```

## File Upload Flow

### S3 Integration Pattern

```
1. Signed URL Generation
   ├── Client requests upload URL
   ├── Server generates signed URL
   ├── Return URL with expiration
   └── Client uploads directly to S3

2. File Processing
   ├── Upload completion notification
   ├── File metadata storage
   ├── Processing queue (if needed)
   └── Database record update
```

This code flow context provides a comprehensive understanding of how different parts of the Hirelytics platform interact and execute.
