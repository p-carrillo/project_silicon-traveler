# ADR 011: Consolidate Root Scripts Under scripts/

**Status:** Accepted  
**Date:** 2026-02-02  

## Context
The repository root had multiple helper and test scripts, which made the top-level directory noisy and harder to scan. We want a predictable place for operational scripts without changing the hexagonal module structure.

## Decision
Move root-level helper and test scripts into a dedicated `scripts/` directory and update all references and relative paths accordingly.

## Alternatives considered
- Keep scripts in the repository root.
- Create a `tools/` or `bin/` directory instead of `scripts/`.
- Replace shell/Node scripts with `package.json` scripts only.

## Consequences
### Positive
- Cleaner repository root and easier navigation.
- A single, discoverable location for operational scripts.

### Negative
- Paths in documentation and commands need updates.
- Relative imports in scripts must be adjusted.

### Follow-ups
- None.
