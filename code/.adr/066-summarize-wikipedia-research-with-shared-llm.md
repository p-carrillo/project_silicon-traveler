# ADR 066: Summarize Wikipedia research with the shared LLM adapter

**Status:** Accepted  
**Date:** 2026-09-24  

## Context

The shared research flow retrieves Wikipedia pages, but its summary is currently a concatenation of search snippets. The Admin research panel and production photo preparation must show and use a factual synthesis of the retrieved page content without implementing separate pipelines. Production and Admin already use the same OpenAI Responses adapter for content generation.

## Decision

- Add an `IResearchSummaryPort` to the research package and inject it into `ResearchPlaceUseCase`.
- Implement this port in the existing OpenAI adapter and make its source-grounded summary prompt available to both production and Admin.
- Retrieve full page content for the top three Wikipedia results in the shared research use case, pass all available page contents to the LLM, and keep plain-text extract fallback plus an explicit summary error if the LLM call fails.
- Reuse `ResearchPlaceUseCase` in both the full photo pipeline and prompts-only pipeline. Admin calls the same use case and adapter, displays the LLM summary, source pages, and summary errors, and requests the summary in the interface language. Production uses the configured content base language.
- Production continues persisting the resulting research summary through the existing route-point research field; the Admin E2E run remains ephemeral.

## Alternatives considered

- Summarize separately inside the Admin endpoint: rejected because it would duplicate behavior and diverge from production.
- Replace the existing content-generation adapter with a new LLM dependency: rejected because the application already configures the OpenAI Responses adapter.
- Fail the photo pipeline when the summary request fails: rejected; a plain-text extract fallback lets content generation proceed while Admin exposes the underlying error.

## Consequences

### Positive

- Admin and production use the same Wikipedia adapter, research use case, and LLM adapter.
- The persisted production research summary comes from retrieved page contents rather than only search snippets.
- Admin can display a clear LLM error while still showing the available extract fallback.

### Negative

- Each successful research lookup adds an OpenAI request and its latency/cost to photo preparation.
- Full Wikipedia source content increases LLM input size.
- The content package now depends on the research package public summary-port contract.

### Follow-ups

- Monitor production summary latency, token usage, and factual quality.
- Consider source-length budgeting if real page sizes produce excessive model input.
