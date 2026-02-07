# ADR 041: Local Seed Photo Source Directory

**Status:** Accepted  
**Date:** 2026-02-07  

## Context

The `scripts/seed-photos.js` workflow downloaded seed images from external URLs. This made local/dev seeding dependent on internet access and external image hosts. The team now stores seed images in-repo (`.ai/pictures_seed`) and needs deterministic local seeding from those files.

## Decision

Use a local source directory for seed images in `scripts/seed-photos.js`:

- Default source directory: `.ai/pictures_seed` (repo-relative)
- Optional override: `SEED_PHOTOS_SOURCE_DIR`
- Seed script validates supported image files (`.jpg`, `.jpeg`, `.png`, `.webp`) and fails fast if there are fewer files than required.
- The script copies local images into the dated `images/` structure and generates thumbnails by file copy.

## Alternatives considered

- Keep remote image URLs (Unsplash) in the seed script
- Bundle remote URLs with a fallback to local

## Consequences

### Positive
- Dev seeding works offline and is deterministic.
- No runtime dependency on third-party image CDNs for seed data.
- Local image curation can be updated by editing `.ai/pictures_seed`.

### Negative
- Seed quality now depends on maintaining local image files.
- Additional env variable (`SEED_PHOTOS_SOURCE_DIR`) must stay documented.

### Follow-ups
- Keep at least 10 valid image files in `.ai/pictures_seed` (or configured directory) for seed runs.
