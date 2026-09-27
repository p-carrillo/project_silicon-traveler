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
- Build a query and return top results with summaries.

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
