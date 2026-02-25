# ADR 062: Remove Water Detection and Ferry-Crossing Flag

**Status:** Accepted  
**Date:** 2026-02-26  

## Context
The route generation pipeline included water detection (`DetectWaterUseCase`) and persisted a ferry-crossing flag (`route_points.is_ferry_crossing`).  
This flag was also propagated to prompts and photo metadata, adding complexity across route, photo, CLI, scheduler, and tests.

The current product direction is to simplify route generation and remove this concept completely.

## Decision
Remove water/ferry-crossing support from the codebase:
- Delete `DetectWaterUseCase` and stop exposing `isWater` in the Overpass port/adapter contract.
- Remove ferry-crossing fields from domain/application contracts (`RoutePoint`, create params, prompt inputs/results, photo metadata).
- Remove all reads/writes of `is_ferry_crossing` in the MariaDB repository.
- Update schema:
  - Remove `is_ferry_crossing` from the route-points table creation migration.
  - Add a forward migration to drop the legacy column from existing databases.

## Consequences
### Positive
- Simpler route-point lifecycle and fewer cross-module dependencies.
- Cleaner prompt/metadata payloads with less legacy coupling.
- Lower maintenance burden in tests and mocks.

### Negative
- Existing historical semantics about ferry crossings are no longer represented.
- Any downstream consumers relying on this field must adapt.
