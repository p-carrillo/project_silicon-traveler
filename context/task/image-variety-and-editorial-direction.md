# Improve image variety and editorial direction

- **Monotask ID:** Not created — local definition only
- **Priority:** Medium
- **Status:** Definition in progress — not synchronized
- **Category:** General

## Problem

The image pipeline begins every generation with the same visual recipe: black-and-white Magnum-style documentary photography, a Hasselblad 500 series, and randomly selected portrait parameters. The location name is nearly the only place-specific input; research does not shape the image brief. This makes portrait-like, square, monochrome images recur even when the location would be better expressed through terrain, infrastructure, architecture, work, weather, transit, or a material detail.

## Outcome

Produce a coherent documentary journal with deliberate visual variety. Each image should have a clear relationship to the location and should differ meaningfully from nearby publications in subject, framing, time, environment, and visual emphasis while preserving a recognisable project identity.

## Scope

- Replace the fixed image-prompt template with a research-informed visual brief.
- Make portraits one selectable editorial category rather than the default output.
- Introduce scene categories, composition rules, and a recent-history diversity window.
- Store the selected visual direction and final revised prompt for auditability.
- Add a quality gate that can request one contrasting regeneration when a result is too similar to recent work.

## Proposed visual taxonomy

- **Territory:** road, coast, plain, mountain, forest, river, or weather system.
- **Built environment:** façade, public building, industrial edge, transport infrastructure, signage, or settlement pattern.
- **Work and economy:** workshop, agriculture, logistics, market, maintenance, or service activity.
- **Movement:** walking, waiting, vehicle, rail, ferry, crossing, or threshold.
- **Material detail:** object, texture, interior, tool, food, clothing, or local surface.
- **Human presence:** portrait, group, silhouette, or figure in environment.

## Acceptance criteria

- The image prompt uses at least one concrete research or route-derived anchor beyond the place name.
- The visual taxonomy category is recorded for each generated image.
- No category, dominant framing, or time-of-day value repeats inside a configurable recent window unless no viable alternative exists.
- Portrait-specific parameters are only generated when the selected category requires human presence.
- A generated image can be audited through its visual brief, source anchors, selected category, original prompt, and revised prompt.
- Unit tests cover category selection, diversity constraints, prompt construction, and fallbacks with sparse research.

## Implementation plan

1. Audit the latest published images and prompts to establish a baseline by subject, framing, tonal treatment, and repeated visual language.
2. Define a pure domain model for `VisualBrief`, including category, factual anchor, subject, setting, composition, time/weather, visual constraints, and negative constraints.
3. Add a repository query for recent published visual briefs and metadata; introduce a diversity selector that excludes recently repeated attributes.
4. Extract visual anchors from research and route context, then choose a category and composition appropriate to the place.
5. Build image prompts from the visual brief. Keep the documentary identity as a flexible style layer, not a fixed scene definition.
6. Generate the image and persist both the initial prompt and provider-revised prompt with the brief.
7. Add a lightweight similarity policy: first compare metadata and prompt overlap; consider image embeddings only after measuring whether heuristic checks are insufficient.
8. Create a curated review set of representative locations and manually evaluate variety, location fidelity, quality, and undesirable stereotypes before enabling it for the scheduler.

## Risks and decisions to resolve

- Documentary prompts can stereotypically depict locations; use research-grounded constraints and reject broad cultural shorthand.
- Image-model adherence is probabilistic, so the first version should optimize prompt and selection quality rather than promise exact visual guarantees.
- Decide whether the permanent look is strictly black-and-white or whether rare, intentional colour series are allowed as an editorial exception.
- Determine storage and migration strategy for visual briefs and similarity metadata.
