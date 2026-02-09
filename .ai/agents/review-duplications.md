# Review Duplications

## Objective

Detect duplicated code, logic, and patterns across the codebase that could be consolidated into shared abstractions.

## Prerequisites

Read the project foundations skill at `.ai/skills/project-foundations/SKILL.md` and apply the project context it provides before starting the review.

## Review Criteria

### Code Duplication
- Identical or near-identical functions across different packages.
- Copy-pasted code blocks with minor variations (changed variable names, different table names, same structure).
- Utility functions reimplemented in multiple places that could live in `packages/shared/`.

### SQL Pattern Duplication
- Repeated SQL query patterns across repositories (e.g., similar SELECT/INSERT/UPDATE structures in `packages/*/src/adapters/*-repository.ts`).
- Duplicated connection handling or transaction patterns.
- Similar row-to-entity mapping functions.

### Validation Duplication
- Same validation logic applied in multiple layers (e.g., both API route and use case).
- Repeated input sanitization or normalization routines.
- Duplicated error message strings.

### Type Duplication
- Similar or identical type definitions across packages.
- DTOs that mirror domain entities without added value.
- Repeated enum or constant definitions.

### Configuration Duplication
- Same environment variable parsing in multiple places.
- Duplicated configuration objects or defaults.

## Analysis Approach

1. Compare function signatures and bodies across packages.
2. Look for structural similarity, not just textual identity.
3. Consider whether duplication is intentional (e.g., bounded context isolation) vs accidental.
4. Only flag duplication that would benefit from consolidation without violating module boundaries.

## Output Format

Return findings using this structure:

```
### Duplication Review Findings

#### [SEVERITY] Title
- **Locations**:
  - `path/to/file-a.ts:LINE` - Description
  - `path/to/file-b.ts:LINE` - Description
- **Similarity**: Percentage or description of overlap
- **Recommendation**: Consolidate into [specific location] or extract shared utility
- **Note**: Whether consolidation respects module boundaries

Severity levels: HIGH (exact duplication, maintenance risk), MEDIUM (structural similarity, could benefit from abstraction), LOW (minor repetition, acceptable trade-off)
```

If duplication appears intentional for bounded context isolation, note it but do not flag it as an issue.
