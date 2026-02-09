---
name: project-foundations
description: "Load project context before performing any analysis or review. Use when a task requires understanding the project's architecture, module structure, coding standards, database schema, or end-to-end flows."
---

# Project Foundations

## Overview

This skill provides foundational project context that every agent or subagent should load before performing analysis, review, or code generation tasks. It ensures consistent understanding of the project's architecture, standards, and conventions.

## When to Use

- Before any code review or analysis task
- When a subagent needs project context it cannot infer from code alone
- When verifying code against project conventions
- When assessing architectural compliance

## Instructions

### Step 1: Load repository overview

Read `AGENTS.md` at the repository root to understand:

- The repo is a Node.js + TypeScript monorepo
- It uses modular hexagonal architecture
- MariaDB without ORM (direct SQL and connections)
- SOLID principles are applied throughout

### Step 2: Understand the module structure

The monorepo is organized as:

- `apps/api/`: HTTP API for photos, journey, and map state.
- `apps/cli/`: CLI commands for migrations and journey setup.
- `apps/scheduler/`: Cron-based generator and publisher jobs.
- `apps/web/`: Next.js frontend consuming the API.
- `packages/content/`: LLM content generation and prompts.
- `packages/image/`: Image generation and thumbnailing.
- `packages/journey/`: Journey domain model and persistence.
- `packages/map/`: Map state and photo pins.
- `packages/photo/`: Photo preparation and publishing pipeline.
- `packages/research/`: Brave search adapter and research use case.
- `packages/route/`: Route point computation and persistence.
- `packages/shared/`: Shared MariaDB pool and utilities.
- `packages/storage/`: Storage ports and local adapter.

Each package follows hexagonal layers: `domain/`, `application/`, `ports/`, `adapters/`.

### Step 3: Load architecture rules

Read `.ai/standards/architecture.md` for:

- Layer separation: domain, application, ports, adapters.
- Domain must NOT depend on infrastructure.
- Adapters depend on ports, never the reverse.
- Cross-module integration happens via ports, not direct imports.
- Use cases are the central orchestration unit.

### Step 4: Load coding standards

Read `.ai/standards/coding.md` for:

- Avoid `any`; use `unknown` with type narrowing.
- Prefer pure functions in the domain.
- Use dependency injection in adapters and application layers.
- Names aligned with business language.
- SOLID principles: SRP, OCP, LSP, ISP, DIP.
- Errors handled with explicit types and consistent messages.

### Step 5: Load database context

Read `docs/agents/DATABASE.md` for:

- Tables: `journey`, `route_points`, `route_point_translations`, `photos`, `photo_translations`, `map_state`, `migrations`.
- Key relationships and foreign keys.
- Status flow for `route_points`: `pending` -> `researched` -> `content_generated` -> `image_ready` -> `published` | `failed`.
- Repositories live in each package's `adapters/` folder.
- All SQL is raw (no ORM).

### Step 6: Load product flows

Read `docs/agents/GOLDEN_PATHS.md` for end-to-end flows:

1. Initialize a journey (CLI).
2. Prepare photos (CLI).
3. Generate and publish photos (Scheduler).
4. Web UI fetches content (API + Web).

### Step 7: Apply context to your task

With this foundational understanding, proceed with your assigned task. Always validate findings against these project conventions rather than generic best practices alone.
