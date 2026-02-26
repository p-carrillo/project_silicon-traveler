# ADR 063: Switch Research Provider to Wikipedia

**Status:** Accepted  
**Date:** 2026-02-26

## Context
The research module depended on Brave Search and required `BRAVE_SEARCH_API_KEY`.
For current usage, we need a simpler provider with public access and predictable, encyclopedic place summaries.

## Decision
Switch the research adapter implementation from Brave Search API to the Wikipedia search API (`/w/api.php`), while preserving the existing `BraveSearchAdapter`/`IBraveSearchPort` public interface for compatibility with existing CLI and scheduler wiring.

## Alternatives considered
- Keep Brave Search with existing key-based integration.
- Replace with another keyless web search provider.

## Consequences
### Positive
- Removes the runtime dependency on `BRAVE_SEARCH_API_KEY`.
- Uses a stable, place-focused public source for research summaries.
- Keeps consumer code unchanged by preserving current adapter/port names.

### Negative
- Adapter/port naming is now legacy (`Brave*`) and does not reflect the real provider.
- Wikipedia responses may vary in snippet quality and language coverage by query.

### Follow-ups
- Rename `BraveSearchAdapter` and `IBraveSearchPort` to provider-agnostic names in a dedicated refactor.
- Update docs under `docs/agents/` to remove stale Brave references.
