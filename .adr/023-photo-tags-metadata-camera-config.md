# ADR 023: Photo Tags/Metadata and Camera Config

**Status:** Proposed  
**Date:** 2026-02-03  

## Context
We need richer photo data (tags and metadata) for search and presentation, and the photographer should only use a small, fixed set of cameras. We want to avoid adding a camera table in the database and keep the pipeline consistent with the existing photo schema.

## Decision
- Add a photographer camera configuration file in `packages/content/src/config/photographer.json` and enforce camera selection in the content adapter.
- Add a photo metadata configuration file in `packages/photo/src/config/photo-metadata.json` for series/volume and roll/frame defaults.
- Store tags as a comma-separated string in `photos.tags` and add a JSON `metadata` column for extra fields (aperture, revised prompt, hero thumbnail, image prompt, ferry flag).
- Extend the publish flow to compute title/location, tags, and editorial metadata before inserting photos.

## Alternatives considered
- Store cameras in a dedicated database table and manage them via CRUD.
- Normalize tags into a separate `photo_tags` table.
- Add more fixed columns instead of a JSON metadata field.

## Consequences
### Positive
- Cameras are controlled via config without extra DB tables.
- Photos gain tags and metadata with minimal schema changes.
- The publish flow becomes the single place to assemble photo display data.

### Negative
- Tags are denormalized (text search only, no relational integrity).
- Metadata JSON is not indexed by default.

### Follow-ups
- Consider tag normalization and indexing if search needs improve.
- Add optional indexing strategies for metadata if query needs grow.
