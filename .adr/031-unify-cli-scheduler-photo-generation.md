# ADR 031: Unify CLI and Scheduler Photo Preparation Pipeline

**Status:** Accepted  
**Date:** 2026-02-04  

## Context
The CLI `prepare-prompts` command and the Scheduler generator job used different orchestration paths. The CLI only generated research + LLM prompts, while the Scheduler ran the full pipeline (including image generation). Route point creation/enrichment also diverged (heading handling, distance computation, ferry detection, and external API failure tolerance). This made results inconsistent and complicated troubleshooting.

## Decision
Introduce a shared `PrepareNextPhotoUseCase` in `@silicon-traveler/photo` that:
- Reuses the same route-point creation/enrichment flow with safe fallbacks for Overpass/Nominatim/water detection.
- Ensures a pending route point exists (create + enrich if needed).
- Executes the full photo pipeline via `PreparePhotoUseCase`.

Both the CLI `prepare-prompts` command and the Scheduler generator job use this shared use case so they run the exact same pipeline.

## Alternatives considered
- Keep separate orchestration logic in CLI and Scheduler.
- Change the CLI to mimic the Scheduler without sharing code.
- Create a new orchestration module/package solely for the generator workflow.

## Consequences
### Positive
- CLI and Scheduler now produce consistent outputs and statuses.
- Shared error handling for external geo services reduces transient failures.
- Single orchestration path reduces duplication.

### Negative
- `prepare-prompts` now generates images and requires image/storage dependencies.
- Scheduler behavior changes to use journey heading and ferry detection consistently.

### Follow-ups
- Consider adding a dedicated prompt-only CLI command if needed.
- Evaluate adding repository queries scoped by journey for pending route points.
