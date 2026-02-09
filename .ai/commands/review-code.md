# Review Code

Perform a comprehensive code review using parallel subagents, each specialized in a different aspect of code quality.

## Step 1: Determine review scope

Identify the files to review:

1. If the user provided specific files or folders as input after the command, use those.
2. If no input was provided, run `git diff --staged --name-only` to get staged files.
3. If there are no staged changes either, ask the user which files or folders to review.

Filter out non-code files (images, configs, lock files) from the scope. Keep the final file list for use in subagent prompts.

## Step 2: Load project context

Read the project foundations skill at `.ai/skills/project-foundations/SKILL.md`. Gather the key project context (architecture rules, module structure, coding standards) to include in each subagent prompt.

## Step 3: Launch review subagents in parallel

Launch the following subagents in two batches (maximum 4 concurrent). Pass each subagent the file list and relevant project context.

### Batch 1 (launch simultaneously)

1. **review-security**: Use the `review-security` subagent to analyze code for security vulnerabilities (SQL injection, XSS, secrets, input validation).
2. **review-duplications**: Use the `review-duplications` subagent to detect duplicated code, logic, and patterns.
3. **review-dependencies**: Use the `review-dependencies` subagent to check for layer violations and cross-module coupling.
4. **review-bugs**: Use the `review-bugs` subagent to identify potential bugs, null refs, race conditions, and edge cases.

### Batch 2 (launch after batch 1 completes)

5. **review-seo**: Use the `review-seo` subagent to analyze SEO, accessibility, and web performance (only if `apps/web/` files are in scope; skip otherwise).
6. **review-refactor**: Use the `review-refactor` subagent to identify refactoring opportunities and SOLID violations.

When launching each subagent, include in its prompt:
- The list of files to review.
- A summary of the project context from the foundations skill.
- Instructions to read its full review criteria from the corresponding `.ai/agents/review-*.md` file.

## Step 4: Consolidate results

After all subagents complete, merge their findings into a single report using this template:

```text
## Code Review Report

### Scope
- Files reviewed: [file list]
- Review date: [current date]

### Summary
| Category      | Critical | High | Medium | Low |
|---------------|----------|------|--------|-----|
| Security      |          |      |        |     |
| Duplications  |          |      |        |     |
| Dependencies  |          |      |        |     |
| SEO           |          |      |        |     |
| Bugs          |          |      |        |     |
| Refactoring   |          |      |        |     |
| **Total**     |          |      |        |     |

### Critical and High Findings
[List all Critical and High severity findings first, grouped by category]

### Medium Findings
[List Medium findings, grouped by category]

### Low Findings
[List Low findings, grouped by category]

### Action Items
1. [Priority] Description - File:Line
2. ...
```

## Step 5: Present results

Present the consolidated report to the user. Highlight the most critical findings first. If no issues were found, confirm that the code passed the review.

## Notes

- If the review scope is very large (>50 files), suggest the user narrow the scope for a more focused review.
- If a subagent finds no issues, include a "No issues found" note in that category rather than omitting it.
- Do not invent or exaggerate issues. Only report findings backed by evidence in the code.
