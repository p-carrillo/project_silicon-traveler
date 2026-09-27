# AGENTS

## Purpose
LLM-backed content generation for image prompts, narratives, and camera metadata using OpenAI's Responses API.

## Responsibilities
- Build LLM prompts and parse responses using OpenAI Responses API.
- Select camera presets and photographer configuration.
- Provide content generation use case, research-summary prompt, and OpenAI adapter.
- Build verified editorial and visual briefs from place research and route facts.
- Rotate narrative modes and regenerate one failed narrative draft before rejecting it.

## Boundaries
- No database access.
- No image generation.

## Entry Points
- `src/index.ts`
- `src/application/generate-content.use-case.ts`
- `src/application/generate-editorial-content.use-case.ts`
- `src/domain/editorial-brief.ts`
- `src/domain/visual-brief.ts`
- `src/config/editorial.ts`
- `src/adapters/openai.adapter.ts`
- `src/config/photographer.ts`
- `src/prompts/content-prompts.ts`
- `src/ports/llm.port.ts`

## Key Flows
- Build structured narrative and visual briefs from place research and verified route facts.
- Select only scene categories grounded in available facts, with the walking route as the sparse-research fallback.
- Build mode-aware developer instructions and user input from `ContentInput`.
- Reject generic or repetitive output after one targeted regeneration.
- Call OpenAI Responses API with GPT-5 model and reasoning enabled.
- Parse text response into `GeneratedContent` (narrative, imagePrompt, cameraMetadata).
- Summarize retrieved Wikipedia source pages through the research summary port.
- Translate content using Responses API with JSON output parsing.

## Dependencies
- OpenAI SDK v6.18.0+ (Responses API support)
- `@silicon-traveler/research` for its public summarization port contract

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
