# Git Workflow & Commit Reference

## Quick Commit Types Reference

| Type       | Description             | Example                                          |
| ---------- | ----------------------- | ------------------------------------------------ |
| `feat`     | New feature             | `feat(auth): add two-factor authentication`      |
| `fix`      | Bug fix                 | `fix(interview): resolve camera detection issue` |
| `docs`     | Documentation           | `docs(api): update endpoint documentation`       |
| `style`    | Code formatting         | `style(components): fix ESLint warnings`         |
| `refactor` | Code restructuring      | `refactor(auth): simplify login flow`            |
| `perf`     | Performance improvement | `perf(db): optimize user query performance`      |
| `test`     | Add/update tests        | `test(auth): add JWT validation tests`           |
| `build`    | Build system changes    | `build(deps): upgrade to Next.js 14.2.16`        |
| `ci`       | CI/CD changes           | `ci(github): update deployment workflow`         |
| `chore`    | Maintenance tasks       | `chore(config): update Prettier settings`        |
| `update`   | General updates         | `update(deps): bump dependencies to latest`      |
| `wip`      | Work in progress        | `wip(interview): implement monitoring feature`   |
| `revert`   | Revert changes          | `revert: undo interview monitoring changes`      |

## Common Scopes

### Feature Areas

- `auth` - Authentication & authorization
- `interview` - Interview system & video calls
- `jobs` - Job management & applications
- `dashboard` - Dashboard views & navigation
- `api` - Backend API endpoints
- `db` - Database & data models

### Technical Areas

- `ui` - User interface components
- `forms` - Form handling & validation
- `config` - Configuration files
- `deps` - Dependencies & packages
- `security` - Security-related changes
- `performance` - Performance optimizations

## Commit Message Templates

### Feature Development

```bash
feat(scope): add [what was added]
feat(scope): implement [what was implemented]
feat(scope): create [what was created]
```

### Bug Fixes

```bash
fix(scope): resolve [what was fixed]
fix(scope): correct [what was corrected]
fix(scope): handle [what edge case was handled]
```

### Documentation

```bash
docs(scope): add [what documentation was added]
docs(scope): update [what was updated]
docs(readme): improve [what was improved]
```

### Maintenance

```bash
chore(deps): update [package] to [version]
chore(config): configure [what was configured]
style(scope): format [what was formatted]
```

## Branch Naming Conventions

- `feature/[scope]-[description]` - New features
- `fix/[scope]-[description]` - Bug fixes
- `docs/[description]` - Documentation updates
- `refactor/[scope]-[description]` - Code refactoring
- `chore/[description]` - Maintenance tasks

## Conventional Commit Rules

1. **Header**: `<type>(<scope>): <subject>` (max 200 chars)
2. **Type**: Required, lowercase, from allowed list
3. **Scope**: Optional, lowercase, feature/area specific
4. **Subject**: Required, imperative mood, no period
5. **Body**: Optional, explain what and why
6. **Footer**: Optional, breaking changes or issue refs

## GitHub Copilot Integration

When GitHub Copilot suggests commit messages, ensure they:

- Follow the conventional commit format
- Use allowed types from commitlint config
- Include relevant scope when applicable
- Use imperative mood in subject line
- Stay within character limits
- Are specific and descriptive
