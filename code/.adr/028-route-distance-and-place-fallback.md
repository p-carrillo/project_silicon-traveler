# ADR 028 - Route Distance 20-30km and Place Name Fallback

**Status:** Accepted  
**Date:** 2026-02-04  

## Context
The journey step distance needs to be increased from the previous 15-20km range. Also, the prompt pipeline requires a real place name, but the Overpass city lookup can fail. We need a reliable fallback place name to keep research and prompt generation meaningful.

## Decision
- Update all route point generation to use a 20-30km step distance.
- When the nearest city lookup fails, fall back to Nominatim reverse geocoding and derive a place name from the returned address fields.

## Alternatives considered
- Keep 15-20km: rejected due to new product requirements.
- Use LLM to propose a place name: rejected to avoid extra cost and dependency.

## Consequences
### Positive
- Longer steps reduce the number of route points needed for long journeys.
- Place names are available even when Overpass is degraded.

### Negative
- Place name fallback may be less precise than a true nearest-city lookup.

### Follow-ups
- Consider a richer place selection strategy using multiple data sources when Overpass is unreliable.
