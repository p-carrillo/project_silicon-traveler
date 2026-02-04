# ADR 026 - Skip Content Generation When Research Is Empty

**Status:** Superseded by ADR 029  
**Date:** 2026-02-04  

## Context
During development, Brave Search can return no results or fail, which makes prompt generation unreliable. We need a safe behavior that avoids calling the LLM when there is no research content available.

## Decision
In `PreparePhotoPromptsUseCase`, if the research summary is empty, we skip LLM content generation and return a result marked as `contentStatus: 'skipped'` with null prompts/metadata. The route point remains at the `researched` stage without content updates.

## Alternatives considered
- Always generate content regardless of research: rejected due to wasted cost and low-quality output.
- Add a CLI-only flag to disable content generation: rejected to keep usage minimal while Brave is unstable.

## Consequences
### Positive
- Avoids unnecessary LLM calls and low-quality prompts when research is missing.
- Keeps the prompt preparation flow safe during upstream outages.

### Negative
- Additional handling is required by consumers when content is skipped.

### Follow-ups
- Consider explicit CLI switches for content generation once Brave is stable.
