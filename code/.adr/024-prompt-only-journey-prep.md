# ADR 024 - Prompt-Only Journey Preparation

**Status:** Superseded by ADR 031  
**Date:** 2026-02-04  

## Context
We need a way to prepare the journey for a configurable number of future days while outputting the prompts used in the pipeline, without generating images. The existing preparation flow (`PreparePhotoUseCase`) couples research + LLM generation with image generation and storage. We also want a reusable, consistent prompt builder for visibility of the exact system/user prompts used by the LLM.

## Decision
- Add a new `PreparePhotoPromptsUseCase` that performs research + LLM content generation and persists the resulting prompts/metadata on the route point without generating images.
- Extract the LLM system and user prompt builder into the `content` module and export it for reuse, keeping prompt construction consistent across adapters and tools.
- Add a CLI command `prepare-prompts` that generates new route points for the next N days and outputs a JSON report with:
  - Research query and summary
  - LLM system/user prompts
  - Image prompt (DALL-E input) and narrative output
  - Camera metadata

## Alternatives considered
- Extend `PreparePhotoUseCase` with a `skipImages` flag: rejected due to mixed responsibilities and ambiguous return types.
- Run the Scheduler generator in a dry-run mode: rejected due to added runtime complexity and less direct output control.
- Duplicate prompt strings in the CLI: rejected due to risk of drift from the adapter implementation.

## Consequences
### Positive
- Prompts can be generated and inspected without incurring image generation costs.
- Prompt construction is centralized and consistent across components.
- The CLI can batch-generate prompt outputs for planning or review.

### Negative
- Adds a new use case and exported prompt helpers to maintain.
- Route points prepared this way stop at `content_generated` and require a separate image step later.

### Follow-ups
- If needed, add a dedicated image-only use case to advance `content_generated` route points to `image_ready`.
