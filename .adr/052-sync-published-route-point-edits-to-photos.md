# ADR 052: Sync Published Route Point Edits to Photos

**Status:** Accepted  
**Date:** 2026-02-12  

## Context
The admin editor updates `route_points`, but `archive` and `map` render data from `photos` and `photo_translations`.  
When editing city/country/region/coordinates for a published route point, the public UI did not reflect those changes.

## Decision
Add a photo application use case that syncs published photo display fields from admin route-point edits:
- Update `photos.title`, `photos.location`, and `photos.coordinates` by `route_point_id`.
- Update `photo_translations.title` and `photo_translations.location` for configured languages.

Wire this synchronization into `PUT /api/admin/route-points/:id` after updating the route point.

## Alternatives considered
- Keep current behavior and require manual SQL fixes.
- Change archive/map queries to read directly from `route_points`.
- Add a separate explicit "sync photo metadata" admin action.

## Consequences
### Positive
- `archive` and `map` reflect admin edits immediately for published points.
- Keeps existing read model (`photos`) and avoids changing public API queries.
- Reuses i18n language config to keep translation rows aligned.

### Negative
- Slightly more work in the admin update flow.
- Extra DB update queries are executed on each admin save.

### Follow-ups
- Optionally expose narrative/title editing for already-published photos in admin.
