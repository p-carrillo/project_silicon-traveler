# ADR 030: Agent Documentation Structure

**Status:** Accepted  
**Date:** 2026-02-04  

## Context
Agent onboarding required more context than the root `AGENTS.md` provided. We need faster orientation for modular work across apps and packages, plus a single index to avoid hunting for entrypoints, commands, and environment details.

## Decision
We will:
- Add `docs/agents/` with an index and cross-cutting references (environment, database, golden paths, debugging).
- Add `AGENTS.md` to every app and package, describing purpose, entrypoints, commands, and tests.
- Update the root `AGENTS.md` to point to the new index and keep module docs in sync.

## Alternatives considered
- Keep only the root `AGENTS.md` and expand it with all module details.
- Use `README.md` alone for agent onboarding.

## Consequences
### Positive
- Faster module discovery and fewer context switches for agents.
- Clear boundaries and responsibilities per module/app.
- Reduced risk of missing key commands or environment requirements.

### Negative
- More documentation files to maintain.
- Updates to module responsibilities require doc updates.

### Follow-ups
- Keep `docs/agents/INDEX.md` updated when modules change.
- Review module `AGENTS.md` during significant refactors.
