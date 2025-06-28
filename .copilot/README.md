# GitHub Copilot Context Configuration

This directory contains configuration files to enhance GitHub Copilot's understanding of the Hirelytics codebase.

## Files

### `instructions.md`

Provides GitHub Copilot with:

- Project architecture overview
- Key patterns and conventions
- Development guidelines
- Interview system context

### `context.txt`

Specifies which files should always be included as context:

- Documentation files (llms.txt, PROJECT_CONTEXT.md, DEVELOPMENT_INSTRUCTIONS.md)
- Schema and type definitions
- Configuration files
- Custom hooks and utilities

## Usage

GitHub Copilot will automatically:

1. Read these instruction files when providing suggestions
2. Include the specified context files for better code completion
3. Follow the established patterns and conventions

## Key Context Files

- **`llms.txt`** - Comprehensive codebase overview for LLM agents
- **`PROJECT_CONTEXT.md`** - Detailed project documentation and architecture
- **`DEVELOPMENT_INSTRUCTIONS.md`** - Setup and development guidelines
- **`schema-context.md`** - Database schemas, TypeScript interfaces, and data models
- **`code-flow-context.md`** - Application flows, authentication, and business logic patterns
- **`api-integration-context.md`** - API endpoints, request/response patterns, and integration guides
- **`validation-context.md`** - Multi-layer validation strategies and error handling patterns
- **`interview-system-context.md`** - Interview system architecture, AI integration, and real-time features
- **`component-patterns-context.md`** - UI component patterns, design system, and layout structures
- **`commit-context.md`** - Commit message guidelines and conventional commit standards

These files provide Copilot with complete context about:

- Project structure and architecture
- Database schemas and API patterns
- Component organization and UI patterns
- Interview system functionality and AI integration
- Authentication flows and security patterns
- Validation strategies and error handling
- Real-time features and WebRTC integration
- Development best practices and coding standards
- Commit message conventions and guidelines

## Workspace Settings

The `.vscode/settings.json` file has been configured with:

- GitHub Copilot enablement
- Context file associations
- Advanced Copilot settings for better suggestions
