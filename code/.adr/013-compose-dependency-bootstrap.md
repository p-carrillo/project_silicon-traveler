# ADR 013: Compose dependency bootstrap via app service

**Status:** Accepted  
**Date:** 2026-02-02  

## Context
The new `api` and `web` services start immediately with `docker compose up`, but runtime failures occurred because workspace dependencies were not present inside the containers. The bind mount of the repo hides build-time `node_modules`, and each service had its own anonymous `node_modules` volume, so dependencies installed in one container were not available to others.

## Decision
Use the `app` service to run `pnpm install` once on startup and expose a healthcheck file to gate the API/web startup. Replace anonymous `node_modules` volumes with a shared named `node_modules` volume mounted across all services so dependency symlinks resolve consistently.

## Alternatives considered
- Run `pnpm install` in each service command (slower and prone to race conditions).
- Require developers to install dependencies on the host and remove container installs.
- Switch pnpm to `node-linker=hoisted` to avoid per-package `node_modules`.

## Consequences
### Positive
- `docker compose up` reliably starts API and Web without manual installs.
- Single install step reduces race conditions.
- Shared `node_modules` avoids broken symlinks between services.

### Negative
- First boot takes longer because dependencies are installed.
- A new named volume is created for dependency storage.

### Follow-ups
- None.
