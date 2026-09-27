# ADR 040: Migrate to OpenAI Responses API

**Status:** Accepted  
**Date:** 2026-02-07  

## Context

OpenAI has released the **Responses API** as the recommended replacement for the Chat Completions API. The Responses API introduces several improvements:

- Support for newer, more capable models (GPT-5 series)
- Built-in reasoning capabilities with configurable effort levels
- Simplified input/output structure with clearer separation between developer instructions and user input
- Better support for multi-modal inputs and structured outputs
- More consistent API design across different use cases

Our content generation module currently uses the Chat Completions API with `gpt-4.1-mini`, which works but lacks access to the latest models and reasoning capabilities. To improve narrative quality and prepare for future OpenAI API evolution, we need to migrate to the Responses API.

## Decision

We will migrate the OpenAI adapter (`packages/content/src/adapters/openai.adapter.ts`) to use the Responses API with the following specifications:

1. **Model**: Use `gpt-5` for both narrative generation and translation
2. **Reasoning**: Enable medium-effort reasoning (`reasoning: { effort: 'medium' }`) for both operations to improve contextual coherence and narrative quality
3. **API structure**: 
   - Replace `messages` array with `instructions` (developer-level) and `input` (user-level) parameters
   - Replace `max_completion_tokens` with `max_output_tokens`
   - Use `output_text` convenience property to extract generated text
4. **SDK version**: Update from `openai@^4.20.0` to `openai@^6.18.0` (Responses API requires >=6.9.1)

### Implementation changes:

**Before (Chat Completions API):**
```typescript
const completion = await this.client.chat.completions.create({
  model: 'gpt-4.1-mini',
  messages: [
    { role: 'system', content: NARRATIVE_SYSTEM_PROMPT },
    { role: 'user', content: prompt },
  ],
  max_completion_tokens: 500,
});
const narrative = this.parseNarrative(completion.choices[0]?.message?.content || '');
```

**After (Responses API):**
```typescript
const response = await this.client.responses.create({
  model: 'gpt-5',
  reasoning: { effort: 'medium' },
  instructions: NARRATIVE_SYSTEM_PROMPT,
  input: prompt,
  max_output_tokens: 500,
});
const narrative = this.parseNarrative(response.output_text || '');
```

## Alternatives considered

### 1. Continue using Chat Completions API
**Rejected:** While still functional, OpenAI has deprecated this API in favor of Responses. Continuing with Chat Completions would block access to newer models like GPT-5 and reasoning capabilities.

### 2. Use gpt-4o-mini instead of gpt-5
**Rejected:** While more cost-effective, gpt-5 with medium reasoning provides significantly better narrative quality and contextual understanding, which is critical for our documentary-style content generation.

### 3. Use low or no reasoning effort
**Rejected:** Medium reasoning effort provides better coherence between narrative and portrait parameters, and better adherence to the documentary style. The cost increase is justified by quality improvement.

### 4. Dual API support (Responses + Chat Completions)
**Rejected:** Adds unnecessary complexity. Clean migration to Responses API is preferred for maintainability.

### 5. Implement Structured Outputs for translation
**Deferred:** While Structured Outputs would guarantee valid JSON responses for translations, the current parsing logic is robust enough. We can implement this as a future optimization if needed.

## Consequences

### Positive
- **Better quality**: GPT-5 with reasoning produces more coherent, contextually aware narratives
- **Future-proof**: Aligned with OpenAI's recommended API direction
- **Cleaner code**: Simplified API structure with `instructions` and `input` parameters
- **Better adherence**: Reasoning helps the model better follow documentary style guidelines and portrait parameter constraints
- **Access to latest models**: Can easily upgrade to newer GPT-5 snapshots or future models

### Negative
- **Cost increase**: GPT-5 with reasoning is more expensive than gpt-4.1-mini:
  - Input tokens: Higher cost per token
  - Reasoning tokens: Additional cost for internal reasoning (not in output)
  - Mitigation: Monitor usage and adjust reasoning effort if needed
- **Breaking change**: Requires updating SDK version and code
- **Response time**: Medium reasoning adds latency to API calls
  - Mitigation: Acceptable for batch operations; not blocking for current use cases

### Follow-ups
- Monitor API costs and narrative quality in production
- Consider implementing Structured Outputs for `translateContent` if JSON parsing becomes unreliable
- Evaluate using reasoning effort as a configurable parameter (low for translations, medium for narratives)
- Consider pinning to specific GPT-5 snapshot versions (e.g., `gpt-5-2025-xx-xx`) once available for production consistency
- Build evals to quantitatively measure narrative quality improvements vs. previous model
