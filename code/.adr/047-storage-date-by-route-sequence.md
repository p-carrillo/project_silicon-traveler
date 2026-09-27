# ADR 047: Storage Date by Route Sequence

**Status:** Accepted  
**Date:** 2026-02-08  

## Context

`PreparePhotoUseCase` saved generated images with `new Date()` as storage date.  
When preparing multiple photos in one run (for example, the initial 10), all files were stored under the same day folder, even though those photos are scheduled for different future publication days.

## Decision

Use a scheduled storage date derived from route sequence order instead of generation timestamp:

- Add `findFirstScheduledByJourney(journeyId)` to `IRouteRepository`.
- Implement it in `MariaDBRouteRepository` to return the first route point in statuses:
  `pending`, `researched`, `content_generated`, `image_ready`.
- In `PreparePhotoUseCase`, compute storage date as:
  `today (00:00 local) + (currentSequence - firstScheduledSequence)` days.

This keeps day-based folders aligned with each photo's expected day in the publication queue.

## Alternatives considered

- Keep using generation day (`new Date()`).
- Move/rename image files at publish time.
- Derive storage date from `created_at` only.

## Consequences

### Positive

- Initial batch generation distributes files across future date folders.
- Storage structure reflects publication order, not generation burst timing.
- No DB schema changes required.

### Negative

- Date assignment is still an estimate tied to sequence queue, not guaranteed publish timestamp.
- Requires one extra repository query during preparation.

### Follow-ups

- If publication cadence becomes configurable (not daily), revisit date calculation strategy.
