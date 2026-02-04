# AGENTS

## Purpose
LLM-backed content generation for image prompts, narratives, and camera metadata.

## Responsibilities
- Build LLM prompts and parse responses.
- Select camera presets and photographer configuration.
- Provide content generation use case and OpenAI adapter.

## Boundaries
- No database access.
- No image generation.

## Entry Points
- `src/index.ts`
- `src/application/generate-content.use-case.ts`
- `src/adapters/openai.adapter.ts`
- `src/config/photographer.ts`
- `src/prompts/content-prompts.ts`

## Key Flows
- Build system and user prompts from `ContentInput`.
- Call OpenAI and parse JSON response into `GeneratedContent`.

## Dependencies
- OpenAI SDK.

## Configuration
- `OPENAI_API_KEY` for real LLM calls.

## Commands
- `pnpm --filter @silicon-traveler/content build`
- `pnpm --filter @silicon-traveler/content dev`
- `pnpm --filter @silicon-traveler/content test`

## Tests
- `packages/content/test`
