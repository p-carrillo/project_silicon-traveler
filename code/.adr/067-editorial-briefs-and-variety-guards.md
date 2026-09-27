# ADR 067: Research-backed editorial briefs and variety guards

**Status:** Accepted
**Date:** 2026-09-24

## Context

Published travel narratives have relied on a fixed contemplative prompt, while collected research is not consistently expressed as a verifiable detail. Repeated entries also lack a reliable mechanism for varying their subject and wording. The route point already stores the journey sequence and base-language narrative, and research summaries are available before content generation.

## Decision

- Build a pure editorial brief from the research summary, verified route facts, route sequence, and bounded same-journey narrative history.
- Use the first usable research sentence as the factual anchor, a second source sentence as a visual/material anchor where available, and a deterministic narrative mode selected from the journey sequence while excluding recent modes.
- When research is weak, use only route place, administrative area, country, coordinates, and distance from the previous point; select `route-observation` and do not infer local customs, history, work, weather, or landmarks.
- Read a bounded history of earlier route-point narratives through the route repository port. Use transparent phrase extraction and token overlap checks alongside anchor presence and a small generic-cliché guard.
- Regenerate a rejected draft once with targeted feedback. If the second draft fails, throw an editorial quality error so photo preparation marks the route point failed and it is not published.
- Apply the same editorial generation use case to the production photo pipeline and prompts-only flow. Keep translation and publishing behavior unchanged.
- Configure the history length with `EDITORIAL_RECENT_HISTORY_LIMIT` (default 5) and mode exclusion window with `EDITORIAL_MODE_RECENT_WINDOW` (default 3, maximum 7).

## Alternatives considered

- Store the selected mode in a schema migration: rejected for the first version because the mode is deterministically derived from the route sequence and no persisted mode field is needed.
- Use embeddings for semantic similarity: deferred until phrase and token heuristics show material false positives or missed repetition.
- Keep a generic fallback narrative after two failed drafts: rejected because it would publish exactly the interchangeable text this task aims to prevent.

## Consequences

### Positive

- Generated narratives receive a concrete, auditable factual anchor and vary their editorial subject.
- Repetition checks use real recent narratives from the same journey and require no external vector service.
- Weak research cannot trigger invented local history or customs; quality failures stop before publication.
- Both production and prompts-only generation use the same brief, prompt, and quality-check logic.

### Negative

- Each rejected first draft adds one LLM call and its associated latency/cost.
- A route point may be marked failed if the model cannot satisfy the anchor or repetition checks after regeneration.
- Heuristic overlap checks can miss semantic repetition and may require tuning after reviewing real editorial samples.

## Follow-ups

- Review a set of real generated samples before treating the new strategy as editorially calibrated.
- Tune thresholds only when observed samples show false positives or missed repetition.
