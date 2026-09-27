# ADR 016: Dockerfile location

**Status:** Accepted  
**Date:** 2026-02-02  

## Context
Dockerfiles lived in the repo root, which adds clutter and makes it harder to group deployment assets consistently.

## Decision
Move `Dockerfile.dev` and `Dockerfile.prod` into a new `docker/` folder and update compose references accordingly.

## Alternatives considered
- Keep Dockerfiles at the repo root.
- Create a `dockerfiles/` directory instead of `docker/`.
- Merge into a single Dockerfile with build arguments.

## Consequences
### Positive
- Cleaner repository root.
- Docker assets are grouped together.

### Negative
- Any external references to the old Dockerfile paths must be updated.

### Follow-ups
- None.
