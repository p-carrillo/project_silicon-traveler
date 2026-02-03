# ADR 020: Archive Date Range Search

**Status:** Accepted  
**Date:** 2026-02-03  

## Context
The archive search currently filters by text fields only (location, title, narrative, tags). We need a date range filter so users can search photos by their published dates while keeping the existing MariaDB schema and indexed `published_at` column.

## Decision
We will:
- Extend `GET /api/photos` to accept optional `start_date` and `end_date` query parameters in `YYYY-MM-DD` format.
- Validate date parameters and reject invalid ranges (start after end).
- Filter using `published_at >= start_date` and `published_at < end_date + 1 day` to make the end date inclusive without breaking the index.
- Add a Date Range action in the archive UI with a calendar picker and keep filters across pagination and search.

## Alternatives considered
- Using `DATE(published_at)` comparisons for simplicity (would reduce index effectiveness).
- Adding a separate `published_date` column (extra schema and write-time overhead).
- Creating a dedicated calendar view instead of inline filtering.

## Consequences
### Positive
- Users can filter archive photos by date range with minimal backend changes.
- Keeps indexed range scans on `published_at`.
- UI provides an explicit, lightweight date selection workflow.

### Negative
- Additional parameter validation and query paths to maintain.
- Filters add more query combinations to test.

### Follow-ups
- Consider adding quick presets (e.g., last 7 days, this month) if requested.
