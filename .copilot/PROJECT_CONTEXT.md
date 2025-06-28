# Hirelytics - AI-Powered Interview Platform

## Project Overview

**Hirelytics** is a comprehensive AI-powered interview platform built with Next.js 14 that enables organizations to conduct intelligent, automated video interviews. The platform provides end-to-end recruitment solutions with advanced features like AI question generation, real-time monitoring, OTP-based authentication, and comprehensive analytics.

## Tech Stack

### Frontend

- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Pre-built component library
- **Radix UI** - Headless UI components (via Shadcn)
- **Lucide React** - Icon library
- **React Hook Form** - Form management with Zod validation

### Backend & Database

- **MongoDB** - Primary database with Mongoose ODM
- **Custom Authentication** - OTP-based JWT authentication
- **Next.js API Routes** - RESTful API endpoints
- **Server Actions** - Next.js server-side mutations

### AI & Media

- **Custom AI Integration** - Question and description generation
- **WebRTC** - Real-time video/audio communication
- **Device APIs** - Camera and microphone testing
- **Canvas/Media APIs** - Screen and camera monitoring

### Cloud & Storage

- **AWS S3** - File storage with signed URLs
- **JWT** - Session management
- **Cookie-based Auth** - Secure session storage

### Development Tools

- **ESLint + Prettier** - Code formatting and linting
- **Husky + Lint-staged** - Git hooks
- **Commitlint** - Conventional commits
- **TanStack Query** - Data fetching and caching
- **pnpm** - Package management

## Project Structure

```
src/
├── @types/           # TypeScript type definitions
├── actions/          # Server actions for data mutations
├── app/             # Next.js App Router pages
│   ├── (auth)/      # Authentication routes
│   ├── (dashboard)/ # Main application dashboard
│   ├── (interview)/ # Interview session pages
│   └── api/         # API routes
├── components/      # Reusable UI components
├── context/         # React contexts
├── db/             # Database schemas and connections
├── hooks/          # Custom React hooks
├── i18n/           # Internationalization
├── lib/            # Utility libraries and configurations
├── providers/      # React providers
└── schema/         # Additional schema definitions
```

## Key Features

### 1. Multi-Role Authentication System

- **Admin**: Full platform management, organization oversight
- **Recruiter**: Job management, candidate evaluation
- **Candidate**: Interview participation, application tracking

### 2. Comprehensive Job Management

- **Multi-step Job Creation**: Basic details → Description → Interview config → Questions
- **AI-Powered Content Generation**: Job descriptions, interview questions
- **Flexible Question Configuration**: Manual or AI-generated questions
- **Industry-Specific Templates**: Predefined skills and question categories

### 3. Advanced Interview System

- **Real-time Video Interviews**: WebRTC-based communication
- **AI Interview Assistant**: Automated question delivery and evaluation
- **Multiple Monitoring Modes**: Screen and camera monitoring (photo/video)
- **Live Transcription**: Speech-to-text conversion
- **Screen Sharing**: Portfolio and presentation capabilities

### 4. Intelligent Question Generation

- **Category-based Questions**: Technical, behavioral, domain-specific
- **Difficulty Levels**: Easy, Normal, Hard, Expert, Advanced
- **Industry Templates**: Technology, Healthcare, Finance, Education, Marketing, Sales
- **AI-Generated Content**: Context-aware question creation

### 5. Monitoring & Analytics

- **Session Recording**: Video and audio capture
- **Periodic Snapshots**: Automated monitoring
- **Real-time Analytics**: Interview progress tracking
- **Comprehensive Reports**: Detailed candidate evaluations

## Database Schema

### Core Entities

#### Users

```typescript
interface IUser {
  id: string;
  name?: string;
  role: 'user' | 'recruiter' | 'admin';
  email: string;
  emailVerified: boolean;
  image: string;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Organizations

```typescript
interface IOrganization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  deleted: boolean;
}
```

#### Jobs

```typescript
interface IJob {
  id: string;
  title: string;
  description: string;
  organizationId: ObjectId;
  industry: string;
  location: string;
  salary?: string;
  skills: string[];
  status: 'draft' | 'published' | 'expired' | 'deleted';
  recruiter: ObjectId;
  interviewConfig: IInterviewConfig;
  questionsConfig: IQuestionConfig;
  expiryDate: Date;
}
```

#### Interview Configuration

```typescript
interface IInterviewConfig {
  duration: number; // minutes
  instructions?: string;
  difficultyLevel: 'easy' | 'normal' | 'hard' | 'expert' | 'advanced';
  screenMonitoring: boolean;
  screenMonitoringMode: 'photo' | 'video';
  screenMonitoringInterval?: 30 | 60;
  cameraMonitoring: boolean;
  cameraMonitoringMode: 'photo' | 'video';
  cameraMonitoringInterval?: 30 | 60;
}
```

#### Questions Configuration

```typescript
interface IQuestionConfig {
  mode: 'manual' | 'ai-mode';
  totalQuestions: number;
  categoryConfigs: IQuestionCategoryConfig[];
  questionTypes: string[];
  questions?: IQuestion[];
}
```

## Environment Configuration

### Required Environment Variables

```bash
# Database
DATABASE_URL=mongodb://...

# Authentication
AUTH_SECRET=your_auth_secret
JWT_SECRET=your_jwt_secret

# OAuth Providers
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
MICROSOFT_CLIENT_ID=...
MICROSOFT_CLIENT_SECRET=...

# AWS S3 Storage
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_ENDPOINT_URL_S3=...
AWS_S3_BUCKET_NAME=...
AWS_REGION=us-east-1

# Application URLs
APP_URL=https://hirelytics.app
NEXT_PUBLIC_APP_URL=https://hirelytics.app
```

## API Architecture

### Server Actions Pattern

The application uses Next.js Server Actions for mutations:

```typescript
'use server';

export async function createJob(data: JobFormData) {
  const { user } = await auth();
  // Validation, database operations
}
```

### Type-Safe API with tRPC

API routes are defined with full TypeScript support and validation.

### RESTful API Endpoints

- `/api/auth/*` - Authentication endpoints
- `/api/ai/*` - AI-powered features
- `/api/organizations/*` - Organization management
- `/api/v1/*` - Versioned API endpoints

## Component Architecture

### UI Components

Built with Radix UI primitives and styled with Tailwind CSS:

- Form components with React Hook Form
- Data tables with TanStack Table
- Modal dialogs and overlays
- Responsive navigation and layouts

### Business Logic Components

- Multi-step form wizards
- Video call interfaces
- Interview management systems
- Real-time monitoring dashboards

## Security Features

### Authentication & Authorization

- JWT-based session management
- Role-based access control
- OAuth integration (Google, Microsoft)
- Secure cookie handling

### Data Protection

- HTTPS enforcement
- Input validation with Zod
- SQL injection prevention
- XSS protection

### Interview Security

- Encrypted video streams
- Secure file uploads
- Access token validation
- Session timeout management

## Performance Optimizations

### Frontend

- Server-side rendering (SSR)
- Image optimization
- Code splitting
- React Suspense boundaries

### Backend

- Database connection pooling
- Cached queries with TanStack Query
- Optimized MongoDB indexes
- Lazy loading strategies

### Media Handling

- WebRTC for low-latency video
- Compressed video streams
- Progressive file uploads
- CDN integration

## Development Workflow

### Code Quality

- ESLint configuration with custom rules
- Prettier for consistent formatting
- Pre-commit hooks with Husky
- Conventional commit messages

### Testing Strategy

- Component testing with React Testing Library
- API testing with Jest
- E2E testing capabilities
- Type checking with TypeScript

### Deployment

- Vercel deployment ready
- Docker containerization support
- Environment-specific configurations
- Automated CI/CD pipelines

## Internationalization

The platform supports multiple languages using next-intl:

- English (default)
- Extensible language support
- Dynamic locale switching
- RTL language support ready

## Monitoring & Analytics

### Application Monitoring

- Error tracking integration ready
- Performance monitoring
- User analytics
- Real-time metrics

### Interview Analytics

- Session duration tracking
- Question response analysis
- Candidate performance metrics
- Recruiter activity reports

## Scalability Considerations

### Database Scaling

- MongoDB cluster support
- Read replica configuration
- Data archiving strategies
- Index optimization

### Application Scaling

- Horizontal scaling ready
- Microservices architecture potential
- Load balancing support
- CDN integration

### Media Scaling

- Video transcoding services
- Storage optimization
- Bandwidth management
- Regional distribution

This comprehensive platform provides a robust foundation for AI-powered recruitment with extensive customization options and enterprise-grade features.
