# Strengthen place research and editorial evidence

- **Monotask ID:** `34b0c64d-bb6b-4771-ae2f-007b27575653`
- **Priority:** High
- **Status:** To do — definition synchronized
- **Category:** General
- **Depends on:** `path-finder.md`
- **Blocks:** `image-variety-and-editorial-direction.md`, `improve-text.md`

## Source description

La investigación actual de cada punto de ruta se limita a concatenar fragmentos de una búsqueda de Wikipedia. Es insuficiente para fundamentar imágenes y textos específicos del lugar, no conserva fuentes ni permite distinguir datos comprobados de texto genérico o de un fallo del proveedor.

## Outcome

Each eligible route point receives a compact, structured and source-attributed place-research brief. The brief separates verified local evidence from route facts and unavailable evidence, so the image and narrative pipelines can make grounded editorial choices without inventing details.

## Scope

- Replace the current unstructured search-snippet concatenation with a typed `PlaceResearchBrief` owned by `@silicon-traveler/research`.
- Resolve the intended place using its name, region, country and coordinates before accepting a source; reject ambiguous results that do not match the route-point geography.
- Use Wikipedia/MediaWiki as the initial editorial source: search only discovers candidates, then a stable page-summary/content endpoint retrieves concise canonical content. Wikipedia is not treated as sufficient identity proof for homonymous places or as an exhaustive source for small settlements.
- Use Wikidata as the structured identity and geographic validation layer where available, matching the selected settlement's label, country/region and coordinates before accepting a Wikipedia source. Use OSM/Nominatim/Overpass only for existing route identity and observable spatial context such as water, transport, land use or nearby infrastructure.
- Keep adapters behind ports so a later approved official local/heritage source can be added without changing editorial use cases. General web search and LLM output may discover candidates but never become evidence without an accepted attributable source.
- Store a bounded set of evidence items with a claim, category, source title, canonical URL, supporting excerpt, source language and retrieval timestamp. Keep raw provider payloads and unbounded page text out of MariaDB.
- Derive a compact editorial brief with eligible factual anchors for place, landscape, built environment, work/economy, movement, material detail and history. Each anchor retains its evidence reference or is explicitly identified as a route observation.
- Persist a current, versioned research snapshot on the route point: research status/version, normalized query, researched-at timestamp, normalized place identity, bounded brief, and safe failure code. The compact brief records accepted evidence, route observations and editorial anchors; preserve URLs and short supporting excerpts but not raw HTML/provider payloads.
- Reuse a completed brief on retry unless an explicit refresh is requested; cache and rate-limit provider calls.
- Return explicit typed outcomes for found, insufficient, ambiguous, unavailable and provider-failed research. Continue safely with route observations when research is insufficient; never represent provider errors as place facts.
- Make the brief available to the content and image use cases and visible in the existing Admin route-point editor, including source links and the distinction between verified evidence and fallback route observations.
- Keep all user-facing Admin strings in the translation catalogue.

## Non-goals

- No open-ended web scraping, search-engine ranking, social-media sourcing, or automatic claim of local customs from weak evidence.
- No attempt to build a complete travel guide, knowledge graph or editorial CMS.
- No automatic source refresh for published entries and no retroactive rewrite of published narratives/images without explicit editorial action.
- No new external provider, production dependency or migration execution without prior approval.

## Functional contract

- Input includes the route point's canonical place name, region, country, coordinates, available OSM tags and requested content language.
- `PlaceResearchBrief` contains a research outcome, normalized place identity, retrieval time, bounded provenance-aware evidence and explicitly typed route observations. Consumers receive no raw provider response.
- A verified editorial anchor must reference one accepted source excerpt, or be derived solely from known route/OSM facts and marked `route_observation`.
- Search-result snippets are only candidate-discovery metadata. An editorial source is not accepted until its canonical page content has been retrieved and its identity has been validated against the route point, using Wikidata/geographic data when available.
- A source is accepted only when its identity plausibly matches the point's place/country/region; the system does not silently use a similarly named settlement elsewhere.
- Provider timeouts, rate limits, malformed payloads and empty searches resolve to safe typed outcomes. They do not mark the route point as factually researched or insert error sentences into prompt context.
- Re-running photo preparation reuses a successful stored brief. An explicit Admin or CLI refresh records a new retrieval timestamp and replaces the draft research brief before content generation.
- Narrative generation receives a selected evidence-backed detail and an editorial mode, and must not make claims beyond the brief. Image generation receives only a visual brief made from visualisable evidence/route observations; non-visual facts such as a founding date cannot by themselves cause an invented scene.
- The research package remains independent of persistence, LLM generation and image generation; persistence and orchestration receive its public DTO through ports and dependency injection.

## Proposed persistence shape

Add only the following current-research fields to `route_points` in an additive migration, after approval:

| Field | Type | Purpose |
| --- | --- | --- |
| `research_status` | bounded enum/string | `found`, `insufficient`, `ambiguous`, `unavailable` or `provider_failed`; never infer factual success from an empty string. |
| `research_version` | integer | Version of the research-brief schema/selection policy used for this snapshot. |
| `research_query` | short text | Normalized query used to discover the candidate source. |
| `researched_at` | datetime nullable | Timestamp of the last successful or safely completed research attempt. |
| `research_identity` | JSON nullable | Canonical place name, region, country, coordinates and optional accepted Wikidata ID/page ID. |
| `research_brief` | JSON nullable | Bounded accepted evidence, route observations and derived editorial anchors, using the shape below. |
| `research_failure_code` | short text nullable | Safe classified error such as `timeout`, `rate_limited` or `source_unavailable`; no raw provider message or secret. |

`research_brief` is a compact audit snapshot, not an archive of provider responses:

```json
{
  "evidence": [
    {
      "claim": "Short verified local fact",
      "category": "built_environment",
      "sourceType": "wikipedia",
      "sourceTitle": "Canonical source title",
      "canonicalUrl": "https://…",
      "excerpt": "Short supporting excerpt",
      "language": "en"
    }
  ],
  "routeObservations": [
    {
      "claim": "The point is beside a railway corridor",
      "sourceType": "osm",
      "category": "movement"
    }
  ],
  "editorialAnchors": [
    {
      "kind": "visual",
      "evidenceIndex": 0,
      "usableFor": ["image", "narrative"]
    }
  ]
}
```

Keep `research_summary` during migration as a legacy/read-only compatibility field. Do not store raw HTML, complete API payloads, rejected search results, provider credentials or unbounded page text.

## Acceptance criteria

- For a point with an unambiguous matching source, the stored brief includes at least one concrete, provenance-linked place fact usable by the image and text tasks.
- A point with a homonymous or geographically mismatched result returns `ambiguous` or `insufficient`; no mismatched source is used as evidence.
- An empty, rate-limited or failed provider request results in a clear non-factual outcome, preserves any prior successful brief and permits only explicitly marked route-observation fallback.
- Repeated preparation of the same route point does not issue another external research request unless a refresh is requested or the stored brief is invalidated by a defined policy.
- The content and image inputs can distinguish verified anchors, route observations and missing evidence; neither receives a provider error string as research.
- Narrative content uses one selected evidence-backed detail when available. Image prompts use a visualisable anchor, setting and explicit negative constraints; weak/non-visual research falls back to a labelled route observation instead of inventing local imagery.
- Admin displays the research outcome, retrieval time and source links without exposing raw payloads or secrets.
- Focused tests cover source matching, evidence/provenance mapping, each safe outcome, caching/refresh and consumer fallback behaviour.

## Implementation plan

1. Audit representative current route points and stored research summaries to establish source quality, ambiguity and failure baselines.
2. Define the pure research DTOs, result states, evidence provenance and port contracts in `@silicon-traveler/research`.
3. Replace the misleading search-only adapter flow with candidate discovery, canonical Wikipedia/MediaWiki summary retrieval, Wikidata/geographic identity validation, OSM route-observation mapping, timeouts and rate limiting behind adapters.
4. Add an additive persistence shape and route repository mapping for the compact versioned snapshot: status, version, query, researched-at timestamp, place identity, bounded evidence/anchors and safe failure code, after schema approval.
5. Extract the duplicate research orchestration from `PreparePhotoUseCase` and `PreparePhotoPromptsUseCase` so scheduler and CLI call one shared preparation operation.
6. Feed typed anchors into the image-direction and text-generation tasks; add Admin read/explicit-refresh controls only after the shared contract is working.
7. Add observability for source outcome, cache hit, refresh and safe fallback without logging provider secrets or unbounded source text.

## Test plan

- Unit-test place identity matching, source acceptance/rejection, evidence limits, route-observation marking, cache policy and refresh replacement.
- Adapter-test recorded Wikipedia/MediaWiki search and summary success, Wikidata identity match/mismatch, OSM observation mapping, disambiguation, empty, malformed, timeout and rate-limit responses; narrow all provider data from `unknown`.
- Integration-test persistence mappings and preservation of a prior successful brief when a refresh fails, when MariaDB is available.
- Use-case-test shared scheduler/CLI preparation with found, insufficient, ambiguous and provider-failed research outcomes.
- Component-test Admin source links, outcome/status presentation and explicit-refresh confirmation/error feedback.
- Manually inspect a curated set of small settlements, homonymous places and sparse-data locations before enabling the image/text dependencies.

## Risks and decisions resolved

- Search-result snippets are discovery hints, not factual evidence. Only validated, attributed source content and typed route facts can become editorial anchors.
- Wikipedia is the initial, globally available editorial source; Wikidata confirms structured identity and OSM provides spatial observations. This bounded combination is preferred to broad web scraping because every usable detail remains attributable and reviewable.
- The first version favours bounded, attributable evidence over broad source coverage. Adding a new provider later is a port/adaptor decision subject to approval and source-policy review.
- A weak or unavailable source must reduce editorial specificity, not cause fabricated local detail. The existing place and route data remain usable as explicitly labelled fallback context.
- The persisted record is a compact current snapshot rather than raw provider data: it supports audit and retry while minimising database size, licensing exposure and migration coupling.
