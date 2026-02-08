# ADR 045: Deterministic TypeScript builds and web i18n imports

**Status:** Accepted  
**Date:** 2026-02-08  

## Context

Production Docker builds failed with TypeScript errors when compiling workspace packages and the web app:

- `TS6305` in `@silicon-traveler/map` referencing `@silicon-traveler/shared` during Docker builds.
- `next build` in `apps/web` failed when importing from `@silicon-traveler/shared` root because it eagerly loads DB pool code that requires `DB_*` variables at build time.

## Decision

- Build `@silicon-traveler/shared` and `@silicon-traveler/map` using TypeScript build mode (`tsc -b`).
- Exclude `*.tsbuildinfo` from Docker build context to avoid stale incremental metadata affecting clean container builds.
- In web i18n server utilities, import from shared i18n subpaths (`@silicon-traveler/shared/dist/i18n/*`) instead of shared root entrypoint.
- Declare `@silicon-traveler/shared` as a direct dependency of `apps/web`.

## Alternatives considered

- Keep `tsc` (non-build mode) and manually enforce package build order only.
- Inject placeholder `DB_*` build-time env vars for web image builds.
- Refactor shared root exports immediately to lazy-load DB pool.

## Consequences

### Positive

- Docker builds are reproducible and no longer depend on stale local incremental artifacts.
- Web production builds do not require database environment variables.
- Workspace dependency declarations remain explicit.

### Negative

- Slightly tighter coupling to shared internal i18n subpaths from web code.
- Build mode can increase compile time in some incremental scenarios.

### Follow-ups

- Consider adding explicit subpath exports for shared i18n utilities (e.g. `@silicon-traveler/shared/i18n`) to avoid importing from `dist/*`.
