# ADR 019: Archive Search With Optional Photo Tags

**Status:** Accepted  
**Date:** 2026-02-03  

## Context
The archive needs a search experience that matches partial, case-insensitive text across photo metadata. The search should include location, title, narrative, and tags. Tags do not exist yet in the UI, but we need them stored to support search.

## Decision
We will:
- Add an optional `tags` column to the `photos` table for search metadata.
- Extend `GET /api/photos` with a `q` parameter and apply a case-insensitive `LIKE` filter across `title`, `narrative`, `location`, and `tags`.
- Keep tags out of the UI for now, using them only for backend search.

## Alternatives considered
- Full-text search in MariaDB (FULLTEXT indexes).
- A separate `photo_tags` table with a normalized many-to-many model.
- External search service (e.g., Elasticsearch).

## Consequences
### Positive
- Minimal schema and API changes.
- Search supports partial matches without UI changes.
- Tags can be added incrementally without blocking the feature.

### Negative
- `LIKE %term%` searches do not use indexes and may be slower at scale.
- Tags are stored as a simple string, which is less structured than a relational model.

### Follow-ups
- Add tag generation/curation to the publishing pipeline.
- Revisit full-text search if query volume or data size grows.
