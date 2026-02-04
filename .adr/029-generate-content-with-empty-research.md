# ADR 029 - Generate Content Even When Research Is Empty

**Status:** Accepted  
**Date:** 2026-02-04  

## Context
We need prompt generation to proceed even when Brave Search returns no results so that journey generation and testing are not blocked. The previous decision to skip LLM calls on empty research prevented prompt output during upstream outages.

## Decision
Always call the LLM to generate prompts, even if the research summary is empty. The summary is passed through as an empty string when no results are available.

## Alternatives considered
- Keep skipping LLM calls on empty research: rejected because it blocks prompt generation.
- Add a CLI flag to force generation: deferred to keep the interface minimal.

## Consequences
### Positive
- Prompt generation continues during Brave outages.
- Easier end-to-end testing of journey generation.

### Negative
- Prompts may be lower quality without research context.

### Follow-ups
- Consider a lightweight local heuristic to enrich research when Brave is unavailable.
