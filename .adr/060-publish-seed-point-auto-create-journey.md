# ADR 060: publish-seed-point Auto-Creates Journey from Oleiros

**Status:** Accepted  
**Date:** 2026-02-26  

## Context
The `publish-seed-point` command is used for quick manual publishing without external AI APIs.  
After a fresh database reset, operators had to run `init-journey` first, otherwise the command failed with `Journey <id> not found`.

## Decision
Update `publish-seed-point` so that when the requested journey does not exist and there is no active journey, it auto-creates a new journey starting at Oleiros and inserts sequence `0` as the starting route point.

Rules:
- If requested journey exists: use it.
- If requested journey does not exist and there is an active journey: fail with a clear error.
- If no journeys exist: create journey at Oleiros and continue publish flow.

## Alternatives considered
- Keep strict behavior and require running `init-journey` manually first.
- Always create a new journey regardless of existing active journeys.
- Hide journey creation behind an extra CLI flag.

## Consequences
### Positive
- Faster first-run workflow after reset.
- One-command manual smoke path for create+publish.
- Keeps route origin consistent with product defaults (Oleiros).

### Negative
- Adds implicit behavior to a command that previously failed explicitly.
- Requires documenting the active-journey conflict rule.

### Follow-ups
- Consider a dedicated `--bootstrap` flag if explicitness is preferred later.
