# AGENTS

## Purpose
LLM-backed content generation for image prompts, narratives, and camera metadata using OpenAI's Responses API.

## Responsibilities
- Build LLM prompts and parse responses using OpenAI Responses API.
- Select camera presets and photographer configuration.
- Provide content generation use case and OpenAI adapter.
- Generate narratives using GPT-5 with medium-effort reasoning for improved contextual coherence.

## Boundaries
- No database access.
- No image generation.

## Entry Points
- `src/index.ts`
- `src/application/generate-content.use-case.ts`
- `src/adapters/openai.adapter.ts`
- `src/config/photographer.ts`
- `src/config/portrait.ts`
- `src/prompts/content-prompts.ts`
- `src/ports/llm.port.ts`

## Key Flows
- Build developer instructions and user input from `ContentInput`.
- Call OpenAI Responses API with GPT-5 model and reasoning enabled.
- Parse text response into `GeneratedContent` (narrative, imagePrompt, cameraMetadata).
- Translate content using Responses API with JSON output parsing.

## Dependencies
- OpenAI SDK v6.18.0+ (Responses API support)

## Configuration
- `OPENAI_API_KEY` for real LLM calls.
- Model: `gpt-5` with reasoning effort set to `medium`
- Max output tokens: 500 for narratives, 800 for translations

## Commands
- `pnpm --filter @silicon-traveler/content build`
- `pnpm --filter @silicon-traveler/content dev`
- `pnpm --filter @silicon-traveler/content test`

## Tests
- `packages/content/test`
