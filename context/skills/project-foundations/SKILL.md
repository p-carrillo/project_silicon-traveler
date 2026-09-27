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

- `code/apps/api/`: HTTP API for photos, journey, and map state.
- `code/apps/cli/`: CLI commands for migrations and journey setup.
- `code/apps/scheduler/`: Cron-based generator and publisher jobs.
- `code/apps/web/`: Next.js frontend consuming the API.
- `code/packages/content/`: LLM content generation and prompts.
- `code/packages/image/`: Image generation and thumbnailing.
- `code/packages/journey/`: Journey domain model and persistence.
- `code/packages/map/`: Map state and photo pins.
- `code/packages/photo/`: Photo preparation and publishing pipeline.
- `code/packages/research/`: Brave search adapter and research use case.
- `code/packages/route/`: Route point computation and persistence.
- `code/packages/shared/`: Shared MariaDB pool and utilities.
- `code/packages/storage/`: Storage ports and local adapter.

Each package follows hexagonal layers: `domain/`, `application/`, `ports/`, `adapters/`.

### Step 3: Load architecture rules

Read `context/standards/architecture.md` for:

- Layer separation: domain, application, ports, adapters.
- Domain must NOT depend on infrastructure.
- Adapters depend on ports, never the reverse.
- Cross-module integration happens via ports, not direct imports.
- Use cases are the central orchestration unit.

### Step 4: Load coding standards

Read `context/standards/coding.md` for:

- Avoid `any`; use `unknown` with type narrowing.
- Prefer pure functions in the domain.
- Use dependency injection in adapters and application layers.
- Names aligned with business language.
- SOLID principles: SRP, OCP, LSP, ISP, DIP.
- Errors handled with explicit types and consistent messages.

### Step 5: Load database context

Read `code/docs/agents/DATABASE.md` for:

- Tables: `journey`, `route_points`, `route_point_translations`, `photos`, `photo_translations`, `map_state`, `migrations`.
- Key relationships and foreign keys.
- Status flow for `route_points`: `pending` -> `researched` -> `content_generated` -> `image_ready` -> `published` | `failed`.
- Repositories live in each package's `adapters/` folder.
- All SQL is raw (no ORM).

### Step 6: Load product flows

Read `code/docs/agents/GOLDEN_PATHS.md` for end-to-end flows:

1. Initialize a journey (CLI).
2. Prepare photos (CLI).
3. Generate and publish photos (Scheduler).
4. Web UI fetches content (API + Web).

### Step 7: Apply context to your task

With this foundational understanding, proceed with your assigned task. Always validate findings against these project conventions rather than generic best practices alone.
