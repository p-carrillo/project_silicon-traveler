# Improve image variety and editorial direction

- **Monotask ID:** `8d80e354-0496-433c-afa4-f6775e6688c0`
- **Priority:** Medium
- **Status:** In progress — locally refined; Monotask sync pending approval
- **Category:** General

## Problem

The image pipeline begins every generation with the same visual recipe: black-and-white Magnum-style documentary photography, a Hasselblad 500 series, and randomly selected portrait parameters. The location name is nearly the only place-specific input; research does not shape the image brief. This makes portrait-like, square, monochrome images recur even when the location would be better expressed through terrain, infrastructure, architecture, work, weather, transit, or a material detail.

## Outcome

Produce a coherent documentary journal with deliberate visual variety. Each image should have a clear relationship to the location and an intentional subject, framing, time, environment, and visual emphasis while preserving a recognisable project identity. Some repetition is natural in a photographer’s body of work and is acceptable.

## Scope

- Replace the fixed image-prompt template with a research-informed visual brief.
- Use a hard Kodak Tri-X 400-inspired black-and-white treatment and a fixed 50 mm focal length.
- Keep human presence as an optional scene category, portray local inhabitants in place-specific everyday contexts, and avoid the generic backpacking visitor. Leave appearance and pose to the image model.
- Introduce scene categories and composition guidance while allowing repeated categories and visual attributes.
- Store the selected visual direction and final revised prompt for auditability.
- Include the generated reflection in the image prompt so the image expresses the same observation as the text.
- Expose visual direction, reflection, source anchors, and provider-revised prompt in the existing Admin E2E photo batch for manual review.
- Allow an active Admin E2E photo batch to be stopped; finish the current photo if its provider request is already in flight, then stop before starting another.

## Proposed visual taxonomy

- **Territory:** road, coast, plain, mountain, forest, river, or weather system.
- **Built environment:** façade, public building, industrial edge, transport infrastructure, signage, or settlement pattern.
- **Work and economy:** workshop, agriculture, logistics, market, maintenance, or service activity.
- **Movement:** walking, waiting, vehicle, rail, ferry, crossing, or threshold.
- **Material detail:** object, texture, interior, tool, food, clothing, or local surface.
- **Human presence:** portrait, group, silhouette, or figure in environment.

## Acceptance criteria

- The image prompt uses at least one concrete research or route-derived anchor beyond the place name.
- The prompt requests a high-contrast Tri-X 400-inspired monochrome look with visible grain.
- Generated camera metadata always records a 50 mm lens and ISO 400.
- The visual taxonomy category is recorded for each generated image.
- Repetition in category, framing, or time of day does not trigger rejection or automatic regeneration.
- Human-presence scenes depict local inhabitants in a source-grounded everyday context and avoid the default young backpacker. Gender presentation, skin tone, age, expression, and pose remain mood-led model choices without stereotypes.
- A generated image can be audited through its visual brief, reflection, source anchors, selected category, original prompt, and provider-revised prompt.
- The Admin E2E photo batch displays the visual brief, reflection, and revised prompt alongside each generated image for manual review of a batch of up to ten images.
- The Admin E2E photo batch provides a stop button that cancels remaining work in the active batch.
- Batch image assets remain available long enough to review the full batch after generation.
- Unit tests cover category selection, anchor grounding, prompt construction, and fallbacks with sparse research.

## Implementation plan

1. Use the existing Admin E2E photo batch to generate up to ten images and review visual direction, place fidelity, and repetition manually.
2. Define a pure domain model for `VisualBrief`, including category, factual anchor, subject, setting, composition, time/weather, visual constraints, and negative constraints.
3. Keep repetition as an allowed editorial outcome; do not add a recent-visual-history query or automatic similarity check.
4. Extract visual anchors from research and route context, then choose a category and composition appropriate to the place.
5. Build image prompts from the visual brief and generated reflection. Leave human depiction choices to the image model while preserving factual anchors. Keep the documentary identity as a flexible style layer, not a fixed scene definition.
6. Persist the selected brief, its source anchors, the original image prompt, and the provider-revised prompt.
7. Review the generated batch in Admin and adjust the taxonomy or prompt rules based on manual feedback before relying on it in the scheduler.

## Decisions resolved

- Documentary prompts must cite a concrete research/route anchor and include constraints against generic cultural shorthand. Human-presence prompts do not specify demographic or portrait attributes; the image model chooses them. The selector chooses a category supported by available research or route facts; when research is sparse, it uses the known walking route as a conservative fallback.
- Version one treats variety as editorial direction, not a hard diversity constraint. It does not compare image embeddings or automatically regenerate images for similarity.
- The default house style remains black and white. Colour is not part of the scheduler's automatic choice; it may be introduced later only as a named, explicitly approved editorial series.
- Store the compact selected `VisualBrief`, source anchor, original prompt, and provider-revised prompt as JSON in an additive `route_points.visual_brief` column. No recent-history index is needed in version one.
- Manual review of the existing ten-photo Admin E2E batch is the quality check for visual variety and location fidelity.
