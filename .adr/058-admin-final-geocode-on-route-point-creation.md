# ADR 058: Admin Final Geocode on Route-Point Creation

**Status:** Accepted  
**Date:** 2026-02-26  

## Context
Admin users can manually set coordinates and also have a `Calculate coordinates` helper based on city/country/region.  
When creating a new route point, coordinates were sometimes kept from linear progression or stale manual input, causing the stored point to diverge from the selected city.

## Decision
On admin route-point creation (`/admin/route-points/new`), run a final geocode attempt at submit time when `place_name` is present.  
If geocoding returns a match, use returned coordinates (and normalized place/country/region fields) for the created route point.  
If geocoding fails or returns no result, keep submitted coordinates and continue creation.

## Alternatives considered
- Keep current behavior and rely only on the explicit `Calculate coordinates` button.
- Force geocoding success before allowing creation.
- Move this behavior to backend `POST /api/admin/route-points` for all clients by default.

## Consequences
### Positive
- Reduces mismatch between selected city and stored coordinates on new admin points.
- Preserves a fast workflow without adding extra required clicks.
- Keeps creation resilient when geocoding is temporarily unavailable.

### Negative
- Adds an extra geocoding request during creation when `place_name` is set.
- Creation behavior now has implicit enrichment that depends on external geocoding quality.

### Follow-ups
- Consider exposing an explicit “auto-geocode on save” toggle in admin forms.
- Evaluate moving the same policy into backend create endpoint when external API clients need consistent behavior.
