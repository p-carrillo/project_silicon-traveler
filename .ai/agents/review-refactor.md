# Review Refactor

## Objective

Identify refactoring opportunities that would improve code quality, readability, and maintainability without changing behavior.

## Prerequisites

Read the project foundations skill at `.ai/skills/project-foundations/SKILL.md` and apply the project context it provides before starting the review.

Pay special attention to `.ai/standards/coding.md` for SOLID principles and TypeScript conventions.

## Review Criteria

### SOLID Violations
- **SRP**: Classes or functions with multiple unrelated responsibilities.
- **OCP**: Code that requires modification (instead of extension) to add new behavior.
- **LSP**: Subtypes that break the contract of their parent.
- **ISP**: Interfaces that force implementors to depend on methods they do not use.
- **DIP**: High-level modules depending on low-level concrete implementations instead of abstractions.

### Function Complexity
- Functions exceeding ~40 lines that could be broken into smaller units.
- Deeply nested conditionals (3+ levels of nesting).
- Functions with more than 3-4 parameters (consider an options object).
- Complex boolean expressions that should be extracted into named variables or functions.

### Naming and Readability
- Variables or functions with unclear, abbreviated, or misleading names.
- Names not aligned with the business domain language.
- Inconsistent naming conventions across similar modules.
- Magic numbers or strings without named constants.

### Dead Code
- Unused functions, variables, types, or imports.
- Commented-out code blocks.
- Unreachable code paths.
- Exported symbols that are never imported anywhere.

### Missing Abstractions
- Repeated patterns that could be extracted into a utility or helper.
- Similar entity mapping logic across repositories that could use a shared pattern.
- Configuration or environment access scattered across files instead of centralized.

### Inconsistent Patterns
- Similar functionality implemented differently across modules (e.g., error handling in one package vs another).
- Mixed async patterns (callbacks, promises, async/await) within the same module.
- Inconsistent use of dependency injection.

### Leveraging Existing Utilities
- Code that reimplements functionality already available in `packages/shared/`.
- Manual implementations of patterns that TypeScript or Node.js built-ins handle natively.
- Opportunities to use existing project conventions and helpers.

### Type Improvements
- Places where `any` could be replaced with proper types or `unknown`.
- Missing return types on public functions.
- Generic types that could make code more reusable.
- Union types that could be narrowed with discriminated unions.

## Output Format

Return findings using this structure:

```
### Refactoring Review Findings

#### [SEVERITY] Title
- **File**: path/to/file.ts:LINE
- **Category**: [solid-violation | complexity | naming | dead-code | missing-abstraction | inconsistency | type-improvement]
- **Evidence**: Code snippet or description
- **Suggestion**: Specific refactoring approach with brief example
- **Benefit**: What improves (readability, testability, maintainability, performance)

Severity levels: HIGH (significantly impacts maintainability or testability), MEDIUM (noticeable improvement opportunity), LOW (minor polish)
```

Focus on actionable suggestions. Do not flag stylistic preferences that have no measurable impact on code quality.
