# Research-grounded visual briefs

**Status:** Accepted
**Date:** 2026-09-25

## Context

The image prompt repeated a fixed portrait composition and camera recipe. The project needs scene direction that draws on verified research or route facts, while allowing natural repetition in a photographer's body of work. Admin already has an ephemeral batch flow that exercises the production photo preparation core.

## Decision

Build a compact, pure VisualBrief from the selected editorial anchor and route sequence. Use a scene category and composition supported by the anchor; when research has no usable visual detail, use the known walking route as a conservative movement scene. Generate portrait parameters only for human-presence scenes. Preserve the black-and-white documentary house style as a flexible style layer.

Persist the visual brief, original image prompt, and provider-revised prompt as JSON in an additive route_points.visual_brief column. Include the brief and revised prompt in Admin E2E results for manual review. Do not reject or regenerate images because of visual similarity.

## Alternatives considered

- Enforce a recent-history diversity window and regenerate similar images.
- Add image embeddings before measuring the value of metadata and prompt review.
- Keep the fixed prompt and rely only on random portrait parameters.

## Consequences

### Positive
- Visual direction is inspectable and tied to an explicit source anchor.
- Admin can review generated images and briefs through the shared photo pipeline.
- Natural repetitions remain possible without extra provider calls.

### Negative
- Keyword-based category grounding may choose a broad scene category and cannot ensure the image model follows every prompt detail.
- The initial implementation does not compute image similarity.

### Follow-ups
- Review a batch of up to ten images in Admin and refine the taxonomy or prompt rules from manual feedback.
