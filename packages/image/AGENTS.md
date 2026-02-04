# AGENTS

## Purpose
Generate images from prompts and create thumbnails.

## Responsibilities
- Call DALL-E for image generation.
- Produce thumbnails with Sharp.
- Expose ports and use cases for image workflows.

## Boundaries
- No database access.
- No content prompt generation.

## Entry Points
- `src/index.ts`
- `src/application/generate-image.use-case.ts`
- `src/application/create-thumbnails.use-case.ts`
- `src/adapters/dalle.adapter.ts`
- `src/adapters/sharp.adapter.ts`

## Key Flows
- Generate a base image from an image prompt.
- Create grid and hero thumbnails from the base image.

## Dependencies
- OpenAI SDK.
- Sharp.

## Configuration
- `OPENAI_API_KEY` for DALL-E generation.

## Commands
- `pnpm --filter @silicon-traveler/image build`
- `pnpm --filter @silicon-traveler/image dev`
- `pnpm --filter @silicon-traveler/image test`

## Tests
- `packages/image/test`
