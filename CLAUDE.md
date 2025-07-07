# Hirelytics - AI Interview Platform

## Project Overview

Hirelytics is a comprehensive AI-powered interview platform built with Next.js 15 (App Router) and TypeScript. The platform serves three main user roles: Admins, Recruiters, and Candidates, with sophisticated AI interview capabilities and comprehensive job application management.

## Technology Stack

### Core Technologies

- **Framework**: Next.js 15.3.4 (App Router)
- **Language**: TypeScript 5
- **Runtime**: Node.js
- **Package Manager**: pnpm (with workspace support)
- **Database**: MongoDB with Mongoose ODM
- **Styling**: Tailwind CSS 4 with shadcn/ui components

### Key Dependencies

- **AI Integration**: @ai-sdk/google, @ai-sdk/openai, @ai-sdk/react
- **Database**: MongoDB, Mongoose
- **Authentication**: Custom JWT implementation with cookies
- **File Storage**: AWS S3 with presigned URLs
- **State Management**: @tanstack/react-query, React Context
- **Form Handling**: React Hook Form with Zod validation
- **UI Components**: Radix UI primitives with shadcn/ui
- **Internationalization**: next-intl
- **Media Handling**: react-webcam, react-mic for interviews

## Project Structure

```
src/
├── @types/               # TypeScript type definitions
├── actions/              # Server actions (Next.js 15 App Router)
├── ai/                   # AI integration utilities
├── app/                  # Next.js App Router pages
│   ├── (auth)/           # Authentication pages
│   ├── (dashboard)/      # Dashboard pages (role-based)
│   ├── (interview)/      # Interview session pages
│   └── api/              # API routes
├── components/           # Reusable React components
│   └── ui/               # shadcn/ui components
├── context/              # React Context providers
├── db/                   # Database schemas and utilities
├── hooks/                # Custom React hooks
├── i18n/                 # Internationalization
├── lib/                  # Utility functions and configurations
├── providers/            # React providers
└── schema/               # Zod schemas for validation
```

## Key Features

### 1. AI Interview System

- **Real-time AI conversations** with job-specific context
- **Speech recognition** and text-to-speech capabilities
- **Video/audio recording** with device selection
- **Screen monitoring** for interview integrity
- **Multi-language support** (English, Hindi)
- **Category-based question management**
- **Progress tracking** and session resumption

### 2. Multi-Role Architecture

- **Admin**: Manage organizations, recruiters, candidates, and jobs
- **Recruiter**: Create jobs, invite candidates, review applications
- **Candidate**: Apply for jobs, take interviews, track applications

### 3. Job Application Management

- **Complete application lifecycle** from invitation to hiring
- **AI-powered interview configuration**
- **Application status tracking**
- **Interview session management**

## Important File Locations

### Configuration Files

- `/package.json` - Dependencies and scripts
- `/tsconfig.json` - TypeScript configuration
- `/next.config.ts` - Next.js configuration
- `/eslint.config.mjs` - ESLint configuration
- `/components.json` - shadcn/ui configuration
- `/src/env.ts` - Environment variables validation

### Core Application Files

- `/src/app/layout.tsx` - Root layout component
- `/src/providers/root-provider.tsx` - Application providers
- `/src/context/auth-context.tsx` - Authentication context
- `/src/db/` - Database schemas and connections
- `/src/actions/` - Server actions for data operations

### AI Interview Implementation

- `/src/app/(interview)/interview/[uuid]/session/` - Interview session components
- `/src/actions/interview-session.ts` - Interview server actions
- `/src/hooks/use-speech-recognition.ts` - Speech recognition hook
- `/src/lib/utils/interview-utils.ts` - Interview utilities

## Development Scripts

```bash
# Development (runs on port 80 with Turbopack)
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Code quality
pnpm lint          # Run ESLint
pnpm lint:fix      # Fix ESLint issues
pnpm check-types   # TypeScript type checking
pnpm format        # Format code with Prettier
pnpm format:check  # Check code formatting
```

## Environment Variables

The application uses comprehensive environment validation via `@t3-oss/env-nextjs`. Key variables include:

### Required Environment Variables

- `DATABASE_URL` - MongoDB connection string
- `AUTH_SECRET` - JWT secret key
- `AWS_ACCESS_KEY_ID` - AWS S3 access key
- `AWS_SECRET_ACCESS_KEY` - AWS S3 secret key
- `AWS_ENDPOINT_URL_S3` - S3 endpoint URL
- `AWS_S3_BUCKET_NAME` - S3 bucket name
- `GOOGLE_API_KEY` - Google AI API key (optional)
- `OPENAI_API_KEY` - OpenAI API key (optional)

### OAuth Configuration

- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`
- `MICROSOFT_CLIENT_ID` & `MICROSOFT_CLIENT_SECRET`

## Database Schema

### Key Collections

- **Users**: Candidate and admin user data
- **Organizations**: Company/organization management
- **Jobs**: Job postings with AI interview configuration
- **JobApplications**: Application tracking with interview state
- **JobInvitations**: Direct candidate invitations
- **InterviewSessions**: AI interview conversation history

### Interview State Management

The system maintains comprehensive interview state including:

- Question categories and progress
- Conversation history with metadata
- Session timing and completion tracking
- AI response context and personalization

## Authentication & Authorization

- **JWT-based authentication** with secure cookie storage
- **Role-based access control** (Admin, Recruiter, Candidate)
- **Multi-domain support** for development and production
- **OTP verification** for secure login flows

## AI Integration

### Supported AI Providers

- **Google AI** (Gemini models)
- **OpenAI** (GPT models)
- **Fallback mechanisms** for service reliability

### AI Features

- **Job-specific interview personalization**
- **Natural conversation flow** without templating
- **Context-aware question generation**
- **Multi-language interview support**
- **Real-time response streaming**

## Code Quality & Standards

### ESLint Configuration

- Next.js and TypeScript rules
- Prettier integration
- Import sorting and unused import removal
- Custom rules for code consistency

### Pre-commit Hooks

- **Husky** for Git hooks
- **lint-staged** for staged file linting
- **Commitlint** for conventional commit messages

## Development Guidelines

### File Organization

- Use absolute imports with `@/` prefix
- Keep components in feature-based folders
- Place shared utilities in `/src/lib/`
- Use TypeScript for all new files

### Component Standards

- Use shadcn/ui components for consistent UI
- Implement proper error boundaries
- Use React Query for data fetching
- Follow Next.js App Router conventions

### Database Operations

- Use server actions for database operations
- Implement proper error handling
- Use Zod schemas for validation
- Follow MongoDB best practices

## Testing

Currently, the project does not have a formal testing setup. Consider adding:

- Jest or Vitest for unit testing
- Testing Library for React component testing
- Playwright for E2E testing

## Common Commands

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build and type check
pnpm build
pnpm check-types

# Code formatting
pnpm format
pnpm lint:fix

# Database operations (if applicable)
# Note: Check /src/actions/ for available server actions
```

## Important Notes

1. **Development Server**: Runs on port 80 (requires sudo on macOS/Linux)
2. **SSL Certificates**: Located in `/certificates/` for HTTPS development
3. **Interview System**: Comprehensive documentation in `AI_INTERVIEW_INTEGRATION.md` and `INTERVIEW_SYSTEM_IMPLEMENTATION.md`
4. **Multi-language**: Uses next-intl for internationalization
5. **File Uploads**: AWS S3 with presigned URLs for security
6. **Real-time Features**: WebRTC for video/audio in interviews

## Architecture Highlights

- **Server Actions**: Extensive use of Next.js 15 server actions instead of API routes
- **Type Safety**: Full TypeScript coverage with Zod validation
- **Performance**: Turbopack for fast development, React 19 for latest features
- **Security**: JWT with secure cookies, environment validation, CORS handling
- **Scalability**: MongoDB with proper indexing, AWS S3 for file storage

This platform represents a modern, full-stack TypeScript application with sophisticated AI integration and comprehensive user management capabilities.
