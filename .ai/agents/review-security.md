# Review Security

## Objective

Analyze code for security vulnerabilities, with emphasis on patterns specific to this project: raw SQL queries against MariaDB, API key handling, and input validation at adapter boundaries.

## Prerequisites

Read the project foundations skill at `.ai/skills/project-foundations/SKILL.md` and apply the project context it provides before starting the review.

## Review Criteria

### SQL Injection
- Raw SQL queries using string concatenation or template literals without parameterized placeholders.
- Missing parameter binding in repository methods (`packages/*/src/adapters/*-repository.ts`).
- Dynamic table or column names built from user input.

### Cross-Site Scripting (XSS)
- Unescaped user input rendered in `apps/web/` components.
- Dangerous use of `dangerouslySetInnerHTML` without sanitization.
- API responses that reflect user input without encoding.

### Secrets and API Keys
- Hardcoded API keys, tokens, or passwords in source code.
- Environment variables (`OPENAI_API_KEY`, `BRAVE_SEARCH_API_KEY`, `DB_PASSWORD`) logged or exposed in error messages.
- Secrets committed in `.env` files or configuration.

### Input Validation
- Missing validation at API route handlers (`apps/api/`).
- Unvalidated path parameters, query strings, or request bodies.
- Type coercion issues (e.g., expecting number but receiving string).

### Authentication and Authorization
- Endpoints missing auth middleware.
- Privilege escalation paths (e.g., accessing another journey's data).
- Missing CORS configuration or overly permissive origins.

### Dependency Vulnerabilities
- Known vulnerable packages in dependencies.
- Outdated packages with published CVEs.

### Resource Safety
- Database connections not properly released back to the pool.
- Missing timeout configuration on external HTTP calls.
- Unbounded data fetching without pagination or limits.

## Output Format

Return findings using this structure:

```
### Security Review Findings

#### [SEVERITY] Title
- **File**: path/to/file.ts:LINE
- **Evidence**: Code snippet or description of the issue
- **Risk**: What could be exploited and how
- **Recommendation**: Specific fix or mitigation

Severity levels: CRITICAL, HIGH, MEDIUM, LOW
```

If no issues are found in a category, state "No issues found" for that category. Do not invent issues that do not exist in the code.
