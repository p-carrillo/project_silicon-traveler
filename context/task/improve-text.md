# Improve editorial text variety and place specificity

- **Monotask ID:** `de2a40ac-a872-4187-88db-c40f8e01d92f`
- **Priority:** Medium
- **Status:** Definition in progress — local plan not yet synchronized
- **Category:** General

## Problem

The generated journal entries share the same contemplative cadence and rely on abstract imagery such as silence, timelessness, wind, vastness, and memory. They are plausible travel prose but often interchangeable between locations. Research is collected but does not reliably become a visible, verifiable detail in the final narrative.

## Outcome

Each published entry should feel grounded in its specific place while retaining the journal's restrained editorial voice. Consecutive entries must vary in perspective, structure, vocabulary, and subject matter rather than repeatedly using generic landscape reflection.

## Scope

- Generate a structured editorial brief from place research before prose generation.
- Add a controlled rotation of narrative modes: field note, local history, infrastructure, terrain and weather, work and economy, movement, material detail, or contrast.
- Require one concrete research-backed detail in each narrative.
- Add an anti-cliche and repetition guard based on recent entries.
- Preserve multilingual generation and the existing publication pipeline.

## Non-goals

- Do not fabricate facts or local customs when research is weak.
- Do not turn every entry into a guidebook, listicle, or long-form article.
- Do not alter already published text as part of the initial implementation.

## Acceptance criteria

- A generated narrative contains one place-specific fact, object, practice, landmark, or observable condition derived from research.
- The system selects a narrative mode and avoids the same mode in a configurable recent window.
- The generator rejects or regenerates entries dominated by generic contemplative phrases without concrete support.
- Tests cover brief construction, mode selection, repetition handling, and the fallback behaviour when research is empty.
- Existing translation and publishing flows continue to work.

## Implementation plan

1. Audit recent published narratives to create a baseline of repeated phrases, repeated sentence patterns, and missing place-specific details.
2. Introduce a domain value object for an editorial brief containing a factual anchor, visual/material anchor, narrative mode, and banned recent phrases.
3. Add a repository port to retrieve a small recent narrative history for the current journey.
4. Build the brief from research, route-point data, and recent history; choose the next narrative mode deterministically or with bounded randomness.
5. Replace the prose prompt with a mode-aware prompt that requires the factual anchor, limits abstractions, and defines a compact journal voice.
6. Add a post-generation quality check. Regenerate once with targeted feedback when the factual anchor is absent or the text has high lexical overlap with recent entries.
7. Extend unit and integration tests, then run an editorial sample review before enabling the new strategy for scheduled generation.

## Risks and decisions to resolve

- Research quality may be insufficient for very small settlements; define a transparent fallback that uses geography or route context without inventing facts.
- Similarity detection can be heuristic initially; decide whether to use phrase overlap only or semantic embeddings in a later phase.
- Decide whether the AI narrator should remain explicitly self-aware in every entry or only when editorially relevant.
