# Commit Skill

## Commit Conventions

Use **Conventional Commits** for all project commits.

### Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Formatting, whitespace, etc. (no code changes)
- **refactor**: Code refactoring (no functionality changes)
- **perf**: Performance improvements
- **test**: Add or modify tests
- **chore**: Build, configs, dependencies, etc.
- **ci**: CI/CD changes
- **revert**: Revert a previous commit

### Scopes (examples)

- `web`: Changes in Next.js frontend
- `api`: Changes in Express API
- `cli`: Changes in CLI commands
- `scheduler`: Changes in scheduler jobs
- `docker`: Changes in Docker/compose
- `deps`: Dependencies
- `config`: Configuration

### Rules

1. The `subject` must be lowercase
2. Don't use a period at the end of the `subject`
3. Use imperative mood ("add" not "added" or "adds")
4. Maximum 72 characters in the first line
5. The `body` is optional but useful to explain the "why"
6. The `footer` is for breaking changes or issue references

### Examples

```bash
feat(web): add health check display on homepage
fix(api): resolve CORS issue on health endpoint
docs: update README with Docker instructions
chore(deps): upgrade next to 15.x
refactor(api): extract health logic to service
feat(cli): add new migration command
fix(scheduler): handle connection timeout gracefully
```

### Breaking Changes

If there are breaking changes:

```
feat(api): change health response format

BREAKING CHANGE: health endpoint now returns { status, timestamp } instead of plain string
```
