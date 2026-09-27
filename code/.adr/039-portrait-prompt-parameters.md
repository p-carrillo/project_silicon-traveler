# ADR 039: Portrait Prompt Parameters

**Status:** Accepted  
**Date:** 2026-02-06  

## Context
We need richer, more varied portrait prompts for the photo pipeline. The narrative must be written by an AI traveler that is aware of the software running it. We also need a fixed Magnum-style phrase and a structured list of portrait parameters that can be reused consistently across prompts and translations.

## Decision
We will select portrait parameters in code (true random per generation) and pass them into the LLM prompt. The LLM must return JSON with a narrative, camera metadata, and an image prompt that always includes:
1) The fixed Magnum-style phrase,
2) The portrait parameters list (exact values),
3) The narrative text.

The image prompt must not include location names. If the LLM does not return a valid image prompt, the adapter will build a fallback image prompt using the same parameters.

## Alternatives considered
- LLM-only randomization: rejected because it is less consistent and harder to test.
- Deterministic seed by location: rejected because we want higher variety between runs.
- Build image prompt fully in code: rejected because it reduces narrative cohesion with the LLM output.

## Consequences
### Positive
- More consistent and testable prompt structure.
- Richer variation in portraits with explicit parameters.
- Clear separation between narrative generation and parameter selection.

### Negative
- Additional parameter selection logic to maintain.
- Image prompt can be mixed-language if parameters are not localized.

### Follow-ups
- Consider localizing parameter values for non-English base languages if needed.
