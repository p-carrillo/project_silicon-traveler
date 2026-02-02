# ADR 015: Docker deploy script location

**Status:** Accepted  
**Date:** 2026-02-02  

## Context
The Docker deploy helper script lived at the repo root, which adds clutter and is inconsistent with other operational scripts housed under `scripts/`.

## Decision
Move `docker-deploy.sh` into `scripts/docker-deploy.sh` and update references to the new path.

## Alternatives considered
- Keep `docker-deploy.sh` in the repo root.
- Rename and merge into another script.
- Replace the script with documentation-only commands.

## Consequences
### Positive
- Cleaner repository root.
- Operational scripts are grouped in `scripts/`.

### Negative
- Any existing references to `./docker-deploy.sh` must be updated.

### Follow-ups
- None.
