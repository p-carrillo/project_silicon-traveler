# Review Dependencies

## Objective

Detect dependency violations between layers and modules, ensuring the hexagonal architecture rules are respected throughout the codebase.

## Prerequisites

Read the project foundations skill at `.ai/skills/project-foundations/SKILL.md` and apply the project context it provides before starting the review.

Pay special attention to `.ai/standards/architecture.md` for the dependency rules:
- Domain does NOT depend on infrastructure.
- Adapters depend on ports, never the reverse.
- Cross-module integration happens via ports.

## Review Criteria

### Layer Violations
- Domain layer (`src/domain/`) importing from adapters (`src/adapters/`) or application (`src/application/`).
- Application layer importing directly from adapters instead of through ports.
- Ports (`src/ports/`) importing concrete implementations.

### Cross-Module Coupling
- A package importing directly from another package's internal modules (e.g., `@silicon-traveler/photo` importing from `@silicon-traveler/route/src/adapters/`).
- Bypassing the public API of a package (importing from `src/` subfolders instead of the package entry point).
- Shared state or singletons accessed across module boundaries.

### Circular Dependencies
- Package A depends on Package B which depends on Package A.
- File-level circular imports within a package.
- Indirect circular dependencies through re-exports.

### Adapter-to-Adapter Dependencies
- One adapter importing from another adapter within the same package.
- Infrastructure adapters depending on each other instead of going through the application layer.

### Import Direction Analysis
For each package, verify the import graph follows:

```
adapters -> ports <- application -> domain
    |                    |
    v                    v
  (external)          (ports)
```

### Apps Layer Violations
- `apps/` should only import from package public APIs and `packages/shared/`.
- Apps should not import from other apps.
- Apps should wire adapters to ports at the composition root only.

## Output Format

Return findings using this structure:

```
### Dependency Review Findings

#### [SEVERITY] Title
- **File**: path/to/file.ts:LINE
- **Violation**: [layer-violation | cross-module-coupling | circular-dependency | adapter-coupling]
- **Import**: `import { X } from 'problematic/path'`
- **Rule broken**: Which architecture rule is violated
- **Recommendation**: How to fix the dependency (e.g., introduce a port, move to shared, use dependency injection)

Severity levels: CRITICAL (domain depends on infra), HIGH (cross-module internal import), MEDIUM (adapter-to-adapter), LOW (minor coupling, easy to fix)
```
