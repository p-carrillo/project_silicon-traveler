# ADR 014: Docker documentation location

**Status:** Accepted  
**Date:** 2026-02-02  

## Context
The Docker deployment guide lived at the repo root, which added noise to top-level navigation. We already keep internal project guidance under `.ai`, so we want Docker docs to align with that structure while preserving discoverability from the README.

## Decision
Move `DOCKER.md` to `.ai/DOCKER.md` and update references (README) to point to the new location.

## Alternatives considered
- Keep `DOCKER.md` at the repo root.
- Create a new `docs/` folder and move the file there.
- Fold the Docker guide into README only.

## Consequences
### Positive
- Cleaner repo root with fewer standalone docs.
- Docker guidance lives alongside other internal project docs.
- Single source of truth still referenced from README.

### Negative
- Any external links or bookmarks to `DOCKER.md` must be updated.

### Follow-ups
- None.
