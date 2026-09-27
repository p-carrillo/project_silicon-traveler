# ADR 059: CLI Publish Seed-Point Command

**Status:** Accepted  
**Date:** 2026-02-26  

## Context
The scheduler flow creates route points and publishes photos, but it depends on external APIs (research/content/image) and scheduled timing.  
For manual testing and demos, operators need a fast command that produces one new published point immediately, without OpenAI/Brave dependencies.

## Decision
Add a new CLI command: `st publish-seed-point`.

Behavior:
- Creates one new route point using the same route progression logic as scheduler preparation (next coordinates, city lookup, reverse geocoding, water detection with graceful fallback).
- Uses a local seed image from `.ai/pictures_seed` (or `SEED_PHOTOS_SOURCE_DIR`) and a generated lorem ipsum narrative.
- Advances route-point status through `pending` → `researched` → `content_generated` → `image_ready`.
- Publishes via `PublishPhotoUseCase` so persistence and status transitions match normal publish flow.
- Calls `/api/map/refresh` by default (can be skipped with `--no-map-refresh`).

## Alternatives considered
- Keep manual SQL/scripts (`seed-photos.js`) that bypass use cases.
- Add a scheduler-only debug mode instead of a CLI command.
- Reuse `prepare-prompts` with mocked adapters at runtime.

## Consequences
### Positive
- Fast deterministic manual publish path for local/dev checks.
- Reuses core domain/application use cases for publish consistency.
- Works without external AI/research credentials.

### Negative
- Adds an extra operational command to maintain.
- Seed-image/lorem output is not editorial quality and is only suitable for testing.

### Follow-ups
- Optionally support a custom narrative file/template instead of lorem ipsum.
- Consider adding an integration smoke test script that wraps this command and validates API responses.
