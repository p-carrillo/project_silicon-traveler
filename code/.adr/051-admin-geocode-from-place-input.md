# ADR 051: Admin Geocode from Place Input

**Status:** Accepted  
**Date:** 2026-02-12  

## Context
Admin users needed a fast way to fill latitude and longitude without manually searching maps. The project already uses Nominatim for reverse geocoding in the route module.

## Decision
Expose a new backend endpoint `GET /api/admin/geocode` that resolves coordinates from `place_name` (plus optional `country` and `region`) using Nominatim search through the route module. In the web admin forms, add a client-side `Calculate coordinates` action that calls a protected proxy route under `/admin/api/geocode` and updates form inputs in place.

## Alternatives considered
- Keep coordinates as manual-only fields.
- Use a server-action redirect flow (reloading the page) after geocoding.
- Call third-party geocoding directly from the browser.

## Consequences
### Positive
- Faster admin workflow with fewer manual errors.
- Reuses existing geocoding provider and architecture boundaries.
- Keeps API keys server-side and route protected by admin session middleware.

### Negative
- Adds one extra admin API endpoint and client interaction logic.
- Geocoding result quality depends on Nominatim availability and query quality.

### Follow-ups
- Add optional “use map click” fallback for ambiguous place names.
