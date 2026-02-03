# ADR 018: Auto-prepare dev workspace in Docker Compose

**Status:** Accepted  
**Date:** 2026-02-03  

## Context
In the dev compose flow, `node_modules` lives in a shared volume. On first boot the volume is empty, so `next` is missing and the API fails when workspace packages have no `dist` output. Developers had to exec into the app container to run `pnpm install` and build packages manually, which made `docker compose up` fragile.

## Decision
Add a dev bootstrap script (`scripts/app-prepare.sh`) that runs in the `app` service to:
- Install dependencies when `node_modules` is missing or the lockfile hash changes.
- Build workspace packages when required `dist` outputs are missing.
- Write a `.dev_ready` marker that the app healthcheck uses.

The `api` and `web` services continue to depend on the app service being healthy.

## Alternatives considered
- Run `pnpm install` and `pnpm build` in every service.
- Pre-bake `node_modules` and `dist` into images and remove the bind mount.
- Keep manual instructions for running installs/builds after `docker compose up`.

## Consequences
### Positive
- `docker compose up` becomes self-sufficient on first boot.
- Avoids duplicate installs/builds across services.
- Health checks ensure API/web start only after dependencies are ready.

### Negative
- First boot is slower due to install/build steps.
- Package rebuilds still require a manual command or a restart after changing sources.

### Follow-ups
- Consider adding optional watch tasks for package rebuilds in dev.
