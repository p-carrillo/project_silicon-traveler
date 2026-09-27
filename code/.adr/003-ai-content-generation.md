# ADR 003: AI Content Generation Pipeline

## Status
Accepted

## Context
The Silicon Traveler application generates daily photos of a journey around the world. Each photo requires:
1. Research about the location
2. A narrative reflecting the photographer's experience
3. An image prompt for DALL-E 3
4. Camera metadata for authenticity
5. A high-quality AI-generated photograph

We need to decide on the AI provider, models, and orchestration approach for this content pipeline.

## Decision

### AI Provider
We will use **OpenAI** for both text generation (GPT-4) and image generation (DALL-E 3):
- **GPT-4**: Generates image prompts, narratives, and realistic camera metadata
- **DALL-E 3**: Creates documentary-style black & white photographs in landscape format (1792x1024)

### Content Generation Pipeline
1. **Research** (Brave Search) → Web research about the location
2. **Content** (GPT-4) → Generates image prompt + narrative + camera metadata
3. **Image** (DALL-E 3) → Creates photograph from prompt
4. **Storage** → Saves image + thumbnails (400x400 grid, 1920x1080 hero)
5. **Photo** → Publishes to database with all metadata

### Orchestration Module
The **Photo module** (`PreparePhotoUseCase`) orchestrates the entire pipeline:
- Consumes a `route_point` in `pending` status
- Updates status incrementally: `researched` → `content_generated` → `image_ready`
- On error, marks status as `failed` with error message
- Atomic: All steps succeed or entire operation rolls back

### Temperature & Creativity
- GPT-4 temperature: **0.8** (creative but coherent narratives)
- DALL-E 3 style: **natural** (photographic realism over artistic interpretation)
- DALL-E 3 quality: **hd** (high detail)

### Prompt Engineering
GPT-4 system prompt establishes persona:
> "You are a documentary photographer traveling the world on foot. You write in first person with introspection and attention to detail, inspired by Magnum photographers."

Image prompts emphasize:
- Documentary style
- Black & white aesthetic
- Magnum photographer influences
- High contrast, grainy film look
- Specific composition and lighting

### Camera Metadata Realism
GPT-4 generates realistic Leica camera settings:
- Camera: Leica M11, M10, or similar
- Lenses: 35mm f/1.4, 50mm f/2, etc.
- ISO: 400-3200 (documentary ranges)
- Shutter speeds: 1/60 to 1/500
- Apertures: f/2 to f/5.6

## Alternatives Considered

### 1. Anthropic Claude for Text Generation
**Pros:**
- Excellent instruction following
- Strong creative writing
- Cost-effective

**Cons:**
- No native image generation
- Would require separate image provider
- Less cohesive prompt-to-image pipeline

**Verdict:** Rejected. OpenAI's tight integration between GPT-4 and DALL-E 3 (prompt understanding) is valuable.

### 2. Midjourney for Image Generation
**Pros:**
- Superior artistic quality
- Better photographic realism
- More control over style

**Cons:**
- No official API (only Discord bot)
- Harder to automate
- Less predictable outputs
- Expensive for daily generation

**Verdict:** Rejected. DALL-E 3 API is simpler, more reliable, and sufficient for our needs.

### 3. Stable Diffusion (Self-hosted)
**Pros:**
- No per-image cost
- Full control over models
- Privacy

**Cons:**
- Requires GPU infrastructure
- Model management complexity
- Slower iteration
- Less consistent quality

**Verdict:** Rejected. Operational complexity outweighs cost savings for MVP.

### 4. Sequential API Calls (No Orchestration)
**Pros:**
- Simpler code
- Each module independent

**Cons:**
- No transactional guarantees
- Harder to retry failed steps
- Status tracking manual
- Partial failures leave inconsistent state

**Verdict:** Rejected. `PreparePhotoUseCase` orchestrator provides atomic operations and clear status flow.

### 5. Pre-generate Batch of Photos
**Pros:**
- Faster publishing (no wait time)
- Better cost control

**Cons:**
- Less responsive to errors
- Stale content if route changes
- More complex buffer management

**Verdict:** Partially adopted. Scheduler maintains buffer of 10 `image_ready` points, but generation happens on-demand (not pre-scheduled days in advance).

## Consequences

### Positive
- **Cohesive pipeline:** Research → Content → Image → Storage → Publish
- **Atomic operations:** All-or-nothing updates with clear status tracking
- **Realistic metadata:** Camera settings add authenticity to AI-generated photos
- **Photographic style:** Consistent black & white documentary aesthetic
- **Error recovery:** Failed steps marked clearly, can be retried
- **API simplicity:** Single OpenAI account for both text and images

### Negative
- **API costs:** ~$0.10-0.15 per photo (GPT-4 + DALL-E 3 HD)
- **Rate limits:** OpenAI API limits may throttle daily generation
- **Vendor lock-in:** Switching from OpenAI requires rewriting adapters
- **Revised prompts:** DALL-E 3 may revise prompts (we store both original and revised)
- **No deterministic output:** Same prompt may generate different images

### Neutral
- Temperature 0.8 balances creativity and consistency (may need tuning)
- 1792x1024 landscape format matches travel photography (not square Instagram format)
- Black & white aesthetic reduces color accuracy concerns but limits visual variety

## Compliance & Ethics
- OpenAI Terms of Service allow commercial use of generated content
- Attribution: No attribution required for DALL-E 3 images
- Content Policy: Prompts avoid prohibited content (no real people, trademarks, violence)
- Disclosure: Website should disclose AI-generated nature of photos (ethical transparency)

## Implementation Notes
- `OpenAIAdapter` implements `ILLMPort` (text generation)
- `DalleAdapter` implements `IImageGeneratorPort` (image generation)
- Both adapters require `OPENAI_API_KEY` environment variable
- GPT-4 responses parsed as JSON (with markdown code block handling)
- Fallback content prevents pipeline failure if API errors occur
- DALL-E 3 URLs expire after 1 hour (must download immediately)
