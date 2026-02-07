# ADR 044: Ensure Docker images build map and scheduler artifacts

**Status:** Accepted  
**Date:** 2026-02-07  

## Context

Production image builds failed when compiling `@silicon-traveler/api` because it imports `@silicon-traveler/map`, which exposes types from `dist/`. The production Docker build sequence did not build `@silicon-traveler/map` before `api`.

Additionally, the production `scheduler` service runs `node dist/index.js`, but the production Docker build did not compile `@silicon-traveler/scheduler`.

## Decision

Update Docker build definitions to guarantee required workspace artifacts exist before runtime:

- Build `@silicon-traveler/map` before building `@silicon-traveler/api` in `docker/Dockerfile.prod`.
- Build `@silicon-traveler/scheduler` in `docker/Dockerfile.prod`.
- Include `packages/map/package.json` in both `docker/Dockerfile.prod` and `docker/Dockerfile.dev` manifest-copy layer for consistency with other workspace packages.

## Alternatives considered

- Keep the existing order and rely on TypeScript project references to infer build order.
- Build only `api` and `web` in image build and compile `scheduler` at container startup.
- Replace explicit package build steps with a single monorepo-wide build command.

## Consequences

### Positive

- Prevents missing module/type errors for `@silicon-traveler/map` during API build.
- Ensures `scheduler` has compiled runtime artifacts in production images.
- Keeps build intent explicit and aligned with current service startup commands.

### Negative

- Slightly longer image build time due to one extra package build step.
- More manual maintenance when adding future workspace packages that affect runtime.

### Follow-ups

- Consider replacing manual ordered build steps with dependency-aware workspace build orchestration.
