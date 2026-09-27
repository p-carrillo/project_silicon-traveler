# ADR 061: Place-Based Coordinate Snap in Automated Generation

**Status:** Accepted  
**Date:** 2026-02-26  

## Context
Automated route generation (scheduler flow and `publish-seed-point`) computed the next coordinate from distance/bearing and then enriched place metadata.  
This could leave the stored coordinate slightly off the resolved city/place, producing visually straight or drifting segments on the map.

## Decision
After city/place resolution, run an extra forward geocode step using the selected place query (`place_name`, `region`, `country`) and, when resolved, replace the route-point coordinate with the geocoded place coordinate before persisting and publishing.

Scope:
- `PrepareNextPhotoUseCase` (scheduler and `prepare-prompts` pipeline)
- `publish-seed-point` command
- `init-journey` command
- `CreateFutureRoutePointUseCase` (admin API route-point creation path)

## Alternatives considered
- Keep the original calculated coordinates and store place data only as labels.
- Snap only in admin/manual workflows.
- Snap on map render time instead of persistence time.

## Consequences
### Positive
- Better alignment between route-point place name and stored coordinates.
- Fewer straight-line artifacts when browsing generated paths.
- Consistent behavior across automated and manual flows.

### Negative
- Adds one extra geocoding request in automated generation.
- Coordinate continuity can shift more aggressively when geocoder returns distant matches.

### Follow-ups
- Add optional max-distance guardrail to reject implausible snap jumps.
