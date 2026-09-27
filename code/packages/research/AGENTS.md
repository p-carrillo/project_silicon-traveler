# AGENTS

## Purpose
Research adapter and use case for place discovery using Wikipedia search.

## Responsibilities
- Execute web searches for place context.
- Normalize results into a simple summary payload.

## Boundaries
- No database access.
- No LLM content generation.

## Entry Points
- `src/index.ts`
- `src/application/research-place.use-case.ts`
- `src/adapters/brave-search.adapter.ts`
- `src/ports/brave-search.port.ts`

## Key Flows
- Search Wikipedia using only the trimmed city/place name, then return top results with summaries and up to 1,200 characters of plain-text article extracts in one Wikipedia API request.
- Admin research can opt in to the full wikitext of the top pages in that same request; production callers do not request full page content by default.
- Preserve optional provider diagnostics for the development-only Admin research command while allowing production callers to keep their safe fallback.

## Dependencies
- Axios.

## Configuration
- `WIKIPEDIA_SEARCH_API_URL` (optional override; defaults to `https://en.wikipedia.org/w/api.php`).
- `WIKIPEDIA_USER_AGENT` (optional custom User-Agent header).

## Commands
- `pnpm --filter @silicon-traveler/research build`
- `pnpm --filter @silicon-traveler/research dev`
- `pnpm --filter @silicon-traveler/research test`

## Tests
- `packages/research/test`
