# Review Bugs

## Objective

Identify potential bugs, edge cases, and runtime errors in the code that could cause failures in production.

## Prerequisites

Read the project foundations skill at `.ai/skills/project-foundations/SKILL.md` and apply the project context it provides before starting the review.

## Review Criteria

### Null and Undefined References
- Accessing properties on potentially `null` or `undefined` values without checks.
- Optional chaining (`?.`) missing where database queries may return `null`.
- Array access without bounds checking.
- Destructuring objects that may be `undefined`.

### Unhandled Promise Rejections
- `async` functions without `try/catch` or `.catch()`.
- Promise chains missing error handlers.
- Fire-and-forget async calls that silently swallow errors.
- Missing `await` on async function calls.

### Race Conditions
- Shared mutable state accessed from concurrent operations (scheduler jobs, parallel API requests).
- Database operations that should be atomic but are not wrapped in transactions.
- Time-of-check to time-of-use (TOCTOU) issues.
- Buffer or queue operations without proper synchronization.

### Error Handling Gaps
- Catch blocks that swallow errors silently (`catch (e) {}`).
- Generic error messages that hide the root cause.
- Missing error propagation in middleware chains.
- Error objects that lose stack trace or context.

### Type Safety Issues
- Incorrect type narrowing or type assertions (`as` casts) that hide runtime mismatches.
- `any` types that bypass compile-time checks.
- Enum comparisons that miss new values.
- JSON parsing without validation (`JSON.parse()` on untrusted input).

### Edge Cases in Business Logic
- Route point status transitions that skip required states (see `pending -> researched -> content_generated -> image_ready -> published | failed`).
- Journey operations when no journey exists.
- Photo operations on route points with `failed` status.
- Division by zero, empty arrays, or zero-length strings in calculations.

### Resource Leaks
- Database connections acquired from the pool but not released (missing `finally` blocks or `using` patterns).
- File handles or streams not closed on error paths.
- Event listeners registered but never removed.
- Timers (`setInterval`, `setTimeout`) not cleared on shutdown.

### Off-by-One and Boundary Errors
- Array indexing errors (especially in pagination or batch processing).
- Date/time calculations crossing boundaries (midnight, timezone, DST).
- String slicing or substring operations with incorrect indices.

## Output Format

Return findings using this structure:

```
### Bug Review Findings

#### [SEVERITY] Title
- **File**: path/to/file.ts:LINE
- **Category**: [null-ref | unhandled-promise | race-condition | error-handling | type-safety | business-logic | resource-leak | boundary-error]
- **Evidence**: Code snippet showing the issue
- **Scenario**: How this bug could manifest in production
- **Recommendation**: Specific fix

Severity levels: CRITICAL (will cause crash or data loss), HIGH (likely to cause errors under normal conditions), MEDIUM (could cause errors under specific conditions), LOW (defensive improvement)
```

Do not flag hypothetical issues without evidence in the code. Only report bugs that have a plausible trigger path.
