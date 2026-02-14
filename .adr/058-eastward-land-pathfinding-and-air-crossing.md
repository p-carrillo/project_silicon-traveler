# ADR 058: Eastward Land Pathfinding and Air Crossing Fallback

**Status:** Accepted  
**Date:** 2026-02-14

## Context
The previous route generation moved east using a fixed bearing with random distance, which produced visibly straight trajectories and ignored road topology. Water handling relied on a ferry flag and text labeling, which did not model long sea barriers well.

We need route generation to:
- Prefer realistic land travel eastward.
- Avoid straight-line movement.
- Cross major water barriers with a single air segment to the nearest viable eastward landfall.
- Keep compatibility with existing route/photo consumers.

## Decision
- Introduce OSRM-based land pathfinding for eastward progression:
  - Evaluate multiple eastward candidate bearings and distances.
  - Request route geometry from OSRM and pick the best east-progressing candidate.
  - Interpolate the next point along the route at the configured step distance.
- Add an air fallback when no valid eastward land route is found:
  - Sample points eastward over water.
  - Select the first non-water landfall.
  - Prefer nearest city around landfall; otherwise use reverse geocoding.
- Add explicit `travel_mode` to `route_points` with enum values `land|air`.
- Keep `is_ferry_crossing` as a legacy compatibility field, but new generation writes `false`.

## Alternatives considered
- Keep fixed-bearing movement and only tune randomness: rejected as still unrealistic.
- Keep ferry model for sea crossing: rejected due to poor behavior on large water barriers.
- Implement self-hosted OSRM first: rejected for higher operational overhead at this stage.

## Consequences
### Positive
- Route points follow road geometry and show less linear artifacts.
- Clear modeling of movement type (`land` vs `air`).
- Sea barriers are crossed deterministically with a single hop.
- CLI and Scheduler share the same planning orchestration.

### Negative
- Additional dependency on an external routing service (OSRM public endpoint by default).
- More planner complexity and API calls per generated point.

## Follow-ups
- Add retries/backoff and optional route caching for OSRM calls.
- Consider regional/provider fallback routing if OSRM availability degrades.
- Evaluate exposing `travel_mode` in additional UI surfaces.
