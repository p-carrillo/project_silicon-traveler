# ADR 032: Configurable Prompt-Only Mode for Photo Preparation

**Status:** Accepted  
**Date:** 2026-02-04  

## Context
After unifying CLI and Scheduler photo preparation into a shared use case, we still need a way to preview prompts without generating images. We want to keep the same route point creation/enrichment flow while allowing callers (CLI) to stop after content generation.

## Decision
Add a `mode` configuration to `PrepareNextPhotoUseCase`:
- `full` (default) runs the complete pipeline including image generation.
- `prompts-only` runs research + LLM content generation via `PreparePhotoPromptsUseCase` and stops at `content_generated`.

The Scheduler uses the default `full` mode. The CLI exposes `--prompts-only` to select prompt-only mode.

## Alternatives considered
- Keep a separate CLI-only implementation: rejected due to drift and duplication.
- Add flags inside `PreparePhotoUseCase`: rejected due to mixed responsibilities.

## Consequences
### Positive
- Same route-point orchestration for CLI and Scheduler.
- Prompts can be generated without image costs.

### Negative
- Route points prepared in prompt-only mode remain `content_generated` and are not picked up by the Scheduler without an additional image step.

### Follow-ups
- Consider an image-only use case to advance `content_generated` points to `image_ready`.
