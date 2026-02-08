# ADR 048: Realign Stored Images by Scheduled Day

**Status:** Accepted  
**Date:** 2026-02-08  

## Context

Before ADR 047, multiple prepared photos could be saved under the same storage day folder because storage used generation time. Existing datasets may already contain this misalignment in file paths and physical folders.

## Decision

Add a maintenance script `scripts/realign-photo-storage-dates.js` that:

- Computes target day for each route point/photo:
  - `photos.published_at` if available.
  - Otherwise sequence-based day (`today + sequence offset`) using the first scheduled route point in the same journey.
- Moves local files in storage (`images/YYYY/MM/DD/...`) to the computed target day.
- Updates path references in:
  - `route_points.image_path`
  - `route_points.thumbnail_path`
  - `photos.image_path`
  - `photos.thumbnail_path`
  - `photos.metadata.heroThumbnailUrl` (when present)
- Runs as dry-run by default and applies changes only with `--apply`.

## Alternatives considered

- Manual SQL + manual filesystem moves.
- Rebuild all images instead of moving existing files.
- Update DB paths only, without moving files.

## Consequences

### Positive

- Existing data can be repaired without regenerating photos.
- Safer operation mode with dry-run default.
- Keeps route point and photo tables consistent with storage layout.

### Negative

- Adds operational maintenance script complexity.
- File move failures (missing source, pre-existing target) still require operator review.

### Follow-ups

- Run dry-run first in each environment and review summary before `--apply`.
- Consider adding CI smoke checks for folder/date consistency on seeded datasets.
