# ADR 033: Fail When Place Name Is Unknown

**Status:** Accepted  
**Date:** 2026-02-04  

## Context
Route point enrichment can leave `placeName` unset or set to `Unknown` when external geo services fail. Continuing the pipeline produces low-quality prompts and images. The system needs to surface these cases early and avoid repeatedly attempting the same unknown place.

## Decision
Add a guard in `PrepareNextPhotoUseCase` that:
- Detects unknown place names (null/empty or `Unknown` variants).
- Marks the route point as `failed` with reason `Unknown place`.
- Throws an exception to stop the pipeline for that route point.

This applies to both CLI and Scheduler since they share the same orchestration.

## Alternatives considered
- Allow unknown places to proceed with generic prompts.
- Only warn in the CLI while keeping the Scheduler running.

## Consequences
### Positive
- Prevents prompt/image generation with non-specific locations.
- Avoids infinite retries on unknown places by marking them as failed.

### Negative
- Requires manual intervention if enrichment repeatedly fails for a location.

### Follow-ups
- Consider retry/backoff rules or a manual override flow for failed route points.
