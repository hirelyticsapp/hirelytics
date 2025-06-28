# Commit Message Context & Guidelines

## Overview

This document provides comprehensive context for GitHub Copilot to generate consistent commit messages following the Hirelytics project's conventional commit standards and commitlint configuration.

## Commit Message Format

### Standard Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Rules & Constraints

- **Header max length**: 200 characters
- **Body max line length**: 200 characters
- **Footer max line length**: 200 characters
- **Type**: Must be lowercase, required
- **Scope**: Must be lowercase, optional
- **Subject**: Required, no trailing period, no sentence/start/pascal/upper case
- **Body**: Optional, leading blank line required if present
- **Footer**: Optional, leading blank line required if present

## Allowed Commit Types

### Primary Types

- **`feat`** - A new feature for the user
- **`fix`** - A bug fix for the user
- **`docs`** - Documentation changes
- **`style`** - Code style changes (formatting, missing semi-colons, etc)
- **`refactor`** - Code changes that neither fix a bug nor add a feature
- **`perf`** - Performance improvements
- **`test`** - Adding or updating tests

### Project Management Types

- **`build`** - Changes to build system or external dependencies
- **`ci`** - Changes to CI/CD configuration files and scripts
- **`chore`** - Maintenance tasks, dependency updates, tooling changes
- **`update`** - General updates that don't fit other categories
- **`wip`** - Work in progress (temporary commits)
- **`revert`** - Reverting previous commits

## Scope Guidelines

### Feature-Based Scopes

- **`auth`** - Authentication and authorization features
- **`interview`** - Interview system, video calls, monitoring
- **`jobs`** - Job creation, management, applications
- **`dashboard`** - Dashboard views and navigation
- **`api`** - API endpoints and backend logic
- **`db`** - Database schemas, migrations, queries
- **`ui`** - UI components, styling, layouts
- **`forms`** - Form handling, validation

### System-Level Scopes

- **`config`** - Configuration files and environment setup
- **`deps`** - Dependency management and updates
- **`security`** - Security-related changes
- **`performance`** - Performance optimizations
- **`monitoring`** - Logging, analytics, error tracking
- **`deploy`** - Deployment and infrastructure changes

### Component-Specific Scopes

- **`components`** - Reusable UI components
- **`hooks`** - Custom React hooks
- **`utils`** - Utility functions and helpers
- **`types`** - TypeScript type definitions
- **`schemas`** - Validation schemas (Zod)
- **`actions`** - Server actions and data mutations

## Commit Message Examples

### Feature Development

```bash
feat(interview): add real-time screen monitoring
feat(auth): implement OTP-based candidate login
feat(jobs): add AI-powered question generation
feat(dashboard): create recruiter analytics view
feat(api): add job application status endpoints
```

### Bug Fixes

```bash
fix(auth): resolve JWT token expiration handling
fix(interview): fix camera permission detection
fix(forms): correct validation error display
fix(api): handle MongoDB connection timeout
fix(ui): fix responsive layout on mobile devices
```

### Documentation & Maintenance

```bash
docs(api): update authentication endpoint documentation
docs(readme): add development setup instructions
chore(deps): update Next.js to version 14.2.16
chore(config): update ESLint configuration
style(components): format code according to Prettier rules
```

### Performance & Refactoring

```bash
perf(interview): optimize video stream processing
perf(db): add indexes for faster job queries
refactor(auth): simplify OTP verification logic
refactor(components): extract reusable form patterns
```

### Testing & CI/CD

```bash
test(auth): add unit tests for JWT utilities
test(interview): add E2E tests for video calls
ci(deploy): update production deployment workflow
build(deps): upgrade TailwindCSS to latest version
```

## Subject Line Best Practices

### Do's ✅

- Use imperative mood ("add", "fix", "update")
- Start with lowercase verb
- Be specific and descriptive
- Focus on what the change does
- Keep under 200 characters

**Examples:**

- `add user profile picture upload`
- `fix authentication redirect loop`
- `update job application validation rules`
- `implement real-time interview monitoring`

### Don'ts ❌

- Don't use past tense ("added", "fixed")
- Don't start with capital letters
- Don't end with periods
- Don't be too generic ("update code", "fix bug")
- Don't exceed character limits

## Body Content Guidelines

### When to Include Body

Include body for:

- Complex changes requiring explanation
- Breaking changes
- Multiple related changes
- Context about why the change was made

### Body Format

```
<type>(<scope>): <subject>

- Detailed explanation of what was changed
- Why the change was necessary
- Any side effects or considerations
- Links to issues or PRs if relevant

Closes #123
```

### Body Examples

```bash
feat(interview): implement AI question generation

- Add OpenAI integration for dynamic question creation
- Support multiple difficulty levels and question types
- Include fallback to manual questions if AI fails
- Add caching to reduce API calls and improve performance

The AI generates contextual questions based on job requirements,
skills, and industry to provide more relevant interview experiences.

Closes #156
```

## Footer Guidelines

### Breaking Changes

```bash
feat(api): update authentication endpoints

BREAKING CHANGE: Authentication endpoints now require API version header.
Update all API calls to include 'API-Version: v2' header.
```

### Issue References

```bash
fix(interview): resolve camera detection issues

Fixes #234
Closes #245
Related to #256
```

## Project-Specific Patterns

### Interview System Changes

```bash
feat(interview): add real-time transcript generation
fix(interview): resolve WebRTC connection stability
perf(interview): optimize video quality adaptation
refactor(interview): simplify monitoring data structure
```

### Authentication System Changes

```bash
feat(auth): implement two-factor OTP verification
fix(auth): handle expired session gracefully
security(auth): enhance JWT token validation
refactor(auth): consolidate login flows
```

### Job Management Changes

```bash
feat(jobs): add batch job posting functionality
fix(jobs): correct job expiration date calculation
update(jobs): enhance job search filters
refactor(jobs): optimize job listing queries
```

### UI/UX Changes

```bash
feat(ui): add dark mode support
fix(ui): resolve mobile navigation issues
style(ui): update component spacing consistency
refactor(ui): migrate to new design system
```

### Database Changes

```bash
feat(db): add job application analytics schema
fix(db): resolve user indexing performance issue
update(db): migrate to optimized user schema
refactor(db): consolidate duplicate query functions
```

## Conventional Commit Tools Integration

### Commitizen Integration

When using commitizen, follow these patterns:

1. Select appropriate type from the allowed list
2. Provide relevant scope if applicable
3. Write clear, imperative subject
4. Add detailed body for complex changes
5. Include footer for breaking changes or issue refs

### Automated Commit Generation

For automated commits (dependency updates, etc.):

```bash
chore(deps): update @types/node to version 20.10.0
build(deps): bump next from 14.1.0 to 14.2.16
ci(workflow): update Node.js version to 20.x
```

## GitHub Copilot Commit Suggestions

When GitHub Copilot suggests commit messages, it should:

1. **Always use allowed types** from the commitlint config
2. **Follow lowercase rules** for type and scope
3. **Use imperative mood** in subject line
4. **Respect character limits** (200 chars max)
5. **Include relevant scope** when changes are feature-specific
6. **Provide clear, actionable descriptions**
7. **Follow project patterns** for similar changes

### Template for Copilot

```
Format: <type>(<scope>): <description>
Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, update, wip, revert
Scopes: auth, interview, jobs, dashboard, api, db, ui, forms, config, components, etc.
Rules: lowercase, imperative mood, no period, max 200 chars
```

This context ensures GitHub Copilot generates commit messages that pass your commitlint validation and maintain consistency across your Hirelytics project.
