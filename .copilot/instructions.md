# GitHub Copilot Instructions for Hirelytics

## Context Files

Always reference these key context files when providing suggestions:

1. **llms.txt** - Comprehensive codebase overview including:

   - Project architecture and tech stack
   - Database schemas and API endpoints
   - Component structure and patterns
   - Development guidelines

2. **PROJECT_CONTEXT.md** - Detailed project documentation including:

   - Feature specifications
   - System architecture
   - Environment configuration
   - Security and performance considerations

3. **DEVELOPMENT_INSTRUCTIONS.md** - Development setup and guidelines including:

   - Local setup instructions
   - Code style and conventions
   - Testing and deployment procedures

4. **commit-context.md** - Commit message guidelines including:
   - Conventional commit standards
   - Allowed types and scopes
   - Message formatting rules
   - Project-specific commit patterns

## Key Project Patterns

- **Authentication**: OTP-based JWT authentication with role-based access control
- **UI Components**: Shadcn/ui + TailwindCSS with TypeScript
- **State Management**: TanStack Query for server state, React hooks for local state
- **Form Handling**: React Hook Form + Zod validation
- **API Structure**: Next.js API routes with MongoDB/Mongoose
- **File Structure**: Feature-based organization with shared components

## Code Style Guidelines

- Use TypeScript for all new code
- Follow React functional component patterns with hooks
- Implement proper error handling and loading states
- Use Zod schemas for runtime validation
- Follow responsive design patterns (mobile-first)
- Maintain consistent naming conventions

## Interview System Context

The platform includes sophisticated interview functionality:

- Real-time video calls with WebRTC
- Screen sharing and recording capabilities
- AI-powered question generation
- Live transcription and monitoring
- Device testing and management

When suggesting code for interview-related features, consider the existing custom hooks:

- `useMediaStream` - Camera/microphone management
- `useRecording` - Video/screen recording
- `useScreenShare` - Screen sharing functionality
- `useSnapshot` - Snapshot capture
- `useSpeechRecognition` - Live transcription

## Database Context

Primary collections:

- Users (admin, recruiter, candidate roles)
- Jobs (with interview config and questions)
- JobApplications (with monitoring data)
- Organizations (multi-tenant structure)
- OTPs (authentication tokens)

Always consider data relationships and proper validation when suggesting database operations.

## Commit Message Guidelines

When suggesting commit messages, always follow these rules:

- **Format**: `<type>(<scope>): <subject>` (max 200 characters)
- **Types**: feat, fix, docs, style, refactor, perf, test, build, ci, chore, update, wip, revert
- **Scopes**: auth, interview, jobs, dashboard, api, db, ui, forms, components, config
- **Subject**: Use imperative mood, lowercase, no period
- **Examples**:
  - `feat(interview): add real-time screen monitoring`
  - `fix(auth): resolve JWT token expiration handling`
  - `docs(api): update authentication endpoint documentation`
  - `chore(deps): update Next.js to version 14.2.16`

Always reference the commit-context.md file for comprehensive guidelines.
