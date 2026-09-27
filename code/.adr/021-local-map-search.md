# ADR 021 - Local Map Search With GeoJSON Basemap

**Status:** Accepted  
**Date:** 2026-02-03  

## Context
We need a geographic search experience with pins for published photos. This is a personal project and must avoid external API calls, rate limits, and usage costs. The map must be persistent and updated when new photos are published.

## Decision
We will render a local basemap using a simplified Natural Earth (1:110m) GeoJSON asset bundled in the web app, and query pins directly from MariaDB using spatial indexes. The map viewport state is stored in a global `map_state` table. When a photo is published, the scheduler calls a local API endpoint to refresh the map state metadata.

## Alternatives considered
- Use hosted map tiles (Mapbox/Google/OSM tiles). Rejected due to external API calls and rate limits.
- Self-host full tile infrastructure (vector/raster) and geocoding. Rejected due to operational cost and complexity.
- Use no basemap at all. Rejected because a minimal geographic silhouette is desired.

## Consequences
### Positive
- Zero external API calls at runtime.
- Predictable costs and no rate-limit failures.
- Simple local deployment and caching.

### Negative
- Basemap is less detailed than commercial tiles.
- Bounding-box search is limited to existing photo metadata (no external geocoding).

### Follow-ups
- Replace the simplified GeoJSON asset with a full Natural Earth 1:110m file when desired.
- Consider optional client-side caching for large pin sets.
