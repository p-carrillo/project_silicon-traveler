# Local inhabitants in human-presence images

**Status:** Accepted
**Date:** 2026-09-25

## Context

Some generated human-presence images default to a young male traveller with a backpack. That person reads as the photographer’s visitor avatar rather than someone who belongs to the place being documented.

## Decision

When the source anchor supports a human-presence scene, direct the image model toward a local resident or community member in an ordinary context that fits the place. Do not default to the travelling photographer, a generic visitor, or a young backpacker. Let gender presentation, skin tone, age, expression, and pose follow the scene’s mood and reflection, without imposing demographic templates, stereotypes, unverified traditional clothing, or invented local identity markers.

## Alternatives considered

- Keep the prompt neutral and allow the recurring visitor pattern to continue.
- Select fixed age, gender, ethnicity, or clothing based on place names.

## Consequences

### Positive
- People read as part of the documented place rather than as a generic travelling protagonist.
- The image model retains freedom to create varied people and poses in response to the scene.

### Negative
- The prompt cannot guarantee the image model will follow the intended local-resident framing.
- “Local” remains a broad editorial cue and must not become an invented ethnic or cultural claim.

### Follow-ups
- Review human-presence outputs in the Admin batch for local context, variety, and stereotyping.
