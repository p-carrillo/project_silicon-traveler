# ADR 010: Testing Strategy (Unit and Integration per Module)

**Status:** Accepted  
**Date:** 2026-02-02  

## Context
The monorepo lacked a consistent testing structure and scripts. We need a repeatable, module-by-module approach that fits the hexagonal architecture and supports both unit and integration coverage.

## Decision
Adopt Vitest for the workspace. Each package has `test/unit` and `test/integration` folders mirroring the module structure. Root scripts run tests recursively (`pnpm test`, `pnpm test:unit`, `pnpm test:integration`). Database integration tests are gated by `RUN_DB_TESTS=true` and required `DB_*` variables.

## Alternatives considered
- Use Jest with custom runners per package.
- Use a single monolithic test folder at the repo root.
- Rely only on unit tests and skip integration tests.

## Consequences
### Positive
- Consistent testing layout across modules.
- Clear separation of unit vs integration coverage.
- Single command to run all tests in the workspace.

### Negative
- Slight overhead maintaining test folders per package.
- Integration tests require explicit environment configuration.

### Follow-ups
- Add CI workflow to run unit tests on every change and integration tests on demand.
