# ADR 049: SEO Audit Skill and Specialized Subagents

**Status:** Accepted  
**Date:** 2026-02-10  

## Context

We added a dedicated `/review-seo` command to audit `apps/web/` for SEO concerns. A single monolithic SEO subagent (`review-seo`) is useful, but it tends to:

- Mix multiple concerns (technical crawl/index, metadata, schema, performance, accessibility) into one review pass.
- Produce inconsistent output and severity grading across runs.
- Make consolidation harder when running multiple reviewers/subagents in parallel.

The repo already uses subagents and commands (`/review-code`) to split responsibilities and then merge findings into a single report.

## Decision

1. Introduce specialized SEO subagents, each with a narrow responsibility and explicit review criteria:
   - `review-seo-technical`
   - `review-seo-canonicals`
   - `review-seo-metadata`
   - `review-seo-structured-data`
   - `review-seo-web-vitals`
   - `review-seo-a11y`
2. Add a coordinator skill `.ai/skills/seo-audit/SKILL.md` that standardizes:
   - Required context reads (foundations + SEO/frontend standards)
   - The subagent run order (two batches, max 4 concurrent)
   - A single consolidated report template and severity guide
3. Update `/review-seo` to reference the coordinator skill for cohesion and consistent output.

## Alternatives considered

- Keep a single `review-seo` subagent only.
- Keep the subagents but embed all coordination logic exclusively in `.ai/commands/review-seo.md` (no skill).
- Use `/review-code` only and skip a dedicated SEO workflow.

## Consequences

### Positive

- More consistent, actionable SEO audit output with clearer categorization.
- Better parallelism and context isolation: each subagent focuses on one dimension.
- Reusable coordinator skill can be referenced by other commands/reviews without duplicating templates and criteria.

### Negative

- More files to maintain (6 subagents + 1 skill).
- Slightly higher overhead when running full audits (more subagent invocations).

### Follow-ups

- Optionally update `/review-code` to use the specialized SEO subagents when `apps/web/` is in scope (instead of the monolithic `review-seo`).

