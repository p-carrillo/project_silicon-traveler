# ADR 046: Web image proxy path normalization and deploy guardrails

**Status:** Accepted  
**Date:** 2026-02-08  

## Context

Production served photo pages with broken images even when files existed under `/app/images`. Two issues combined:

- Web UI built image URLs as `/api/images/${photo.image_path}` and some DB values already contained `/images/...`, producing `/api/images/images/...`.
- A production deploy snapshot was missing `apps/web/src/app/api/images/[...path]/route.ts`, so Next.js returned a generic 404 for `/api/images/*`.

## Decision

- Add a shared web utility (`toProxyImageSrc`) that normalizes image paths by removing leading `/` and optional leading `images/`.
- Use that utility in journal, archive, and map active frame image source generation.
- Harden the production GitHub Actions workflow with:
  - A fail-fast check that `apps/web/src/app/api/images/[...path]/route.ts` exists on the target server after sync.
  - A smoke test against `http://localhost:3001/api/images/images-proxy-smoke-test.jpg` expecting `404` with body `Image not found`.

## Alternatives considered

- Keep duplicated URL construction logic in each component.
- Only verify container health without route-level smoke tests.
- Point frontend directly to API `/images/*` and bypass the Next.js proxy route.

## Consequences

### Positive

- Prevents `images/images` path regressions from mixed DB path formats.
- Detects missing proxy route files before declaring deployment successful.
- Keeps image delivery behind the existing web proxy route.

### Negative

- Adds one shared utility and minor coupling for image URL formatting.
- Deployment verification is stricter and may fail on misconfigured snapshots that previously passed.

### Follow-ups

- Ensure production deployment source always tracks current `main` before sync.
- Consider adding an additional smoke test that validates one real published image path.
