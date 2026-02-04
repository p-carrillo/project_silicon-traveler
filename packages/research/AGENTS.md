# AGENTS

## Purpose
Research adapter and use case for place discovery using Brave Search.

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
- `BRAVE_SEARCH_API_KEY` or `BRAVE_API_KEY`.

## Commands
- `pnpm --filter @silicon-traveler/research build`
- `pnpm --filter @silicon-traveler/research dev`
- `pnpm --filter @silicon-traveler/research test`

## Tests
- `packages/research/test`
