# AGENTS

## Purpose
Research adapter and use case for place discovery using Wikipedia search.

## Responsibilities
- Execute web searches for place context.
- Normalize Wikipedia results and orchestrate an injected LLM port to summarize retrieved source content.

## Boundaries
- No database access.
- No narrative or image content generation; summarize retrieved research only through the injected summary port.

## Entry Points
- `src/index.ts`
- `src/application/research-place.use-case.ts`
- `src/adapters/brave-search.adapter.ts`
- `src/ports/brave-search.port.ts` (search and research summary contracts)

## Key Flows
- Search Wikipedia using only the trimmed city/place name and retrieve up to three full page revisions, excerpts, and snippets in one API request.
- Pass all available page content to the injected summary port and fall back to plain-text extracts if LLM summarization fails.
- Production and Admin use the same research use case and OpenAI summary adapter; summary language follows the configured content language or Admin UI language.
- Admin research can opt in to the full wikitext of the top pages in that same request; production callers do not request full page content by default.
- Preserve optional provider diagnostics for the development-only Admin research command while allowing production callers to keep their safe fallback.

## Dependencies
- Axios.
- `IResearchSummaryPort` supplied by the caller.

## Configuration
- `WIKIPEDIA_SEARCH_API_URL` (optional override; defaults to `https://en.wikipedia.org/w/api.php`).
- `WIKIPEDIA_USER_AGENT` (optional custom User-Agent header).

## Commands
- `pnpm --filter @silicon-traveler/research build`
- `pnpm --filter @silicon-traveler/research dev`
- `pnpm --filter @silicon-traveler/research test`

## Tests
- `packages/research/test`
