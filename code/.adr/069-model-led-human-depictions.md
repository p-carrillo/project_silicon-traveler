# Model-led human depictions

**Status:** Accepted
**Date:** 2026-09-25

## Context

The content package previously selected portrait attributes in code, including age, gender, income class, framing, expression, gaze, posture, activity, and camera treatment. These choices can make generated people feel formulaic and limit the image model when a research-grounded scene includes people.

## Decision

Remove the portrait attribute catalog and its random selector from the content generation path and public package API. Keep human presence as a possible visual category, with its factual anchor and broad scene direction. Let the image model choose the people’s appearance and photographic treatment. This supersedes the portrait-parameter decision in ADR 068 and ADR 039.

## Alternatives considered

- Keep random portrait attributes for consistency across generations.
- Replace the random catalog with a smaller set of curated portrait recipes.

## Consequences

### Positive
- Human depictions can vary naturally and respond more directly to the research anchor and reflection.
- The prompt no longer assigns people demographic or socioeconomic attributes without source support.

### Negative
- Portrait framing and appearance become less predictable between generations.
- The image model may interpret a broad human-presence direction inconsistently.

### Follow-ups
- Review human-presence results in the Admin batch and adjust only if factual grounding or the documentary house style suffers.
