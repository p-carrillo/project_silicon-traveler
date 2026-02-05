# ADR 038: Docker documentation under docs/agents

**Status:** Accepted  
**Date:** 2026-02-05  

## Context
The Docker deployment guide existed in multiple locations. The agent documentation entry point is `docs/agents/INDEX.md`, so keeping Docker guidance in the same tree improves discoverability and avoids split sources of truth.

## Decision
Use `docs/agents/DOCKER.md` as the canonical Docker deployment guide and update references to point there.

## Alternatives considered
- Keep the guide under `.ai/DOCKER.md` and reference it from README only.
- Keep two copies and rely on manual synchronization.

## Consequences
### Positive
- Single, discoverable location aligned with the rest of the agent docs.
- Reduced confusion about where the authoritative Docker guide lives.

### Negative
- Existing bookmarks or references to `.ai/DOCKER.md` must be updated.

### Follow-ups
- Ensure `README.md`, `AGENTS.md`, and `docs/agents/INDEX.md` reference the new canonical path.
