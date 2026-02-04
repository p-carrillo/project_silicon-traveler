# AGENTS

## Repository Summary
This repo is a Node.js + TypeScript monorepo with a modular hexagonal architecture and MariaDB without an ORM (direct SQL and connections). The codebase follows the most widely adopted TypeScript standard and applies SOLID.

## Agent Documentation
- `docs/agents/INDEX.md`: Entry point for agent-facing documentation.
- `docs/agents/ENVIRONMENT.md`: Environment variables and defaults.
- `docs/agents/DATABASE.md`: Database schema overview and migrations.
- `docs/agents/GOLDEN_PATHS.md`: End-to-end flows for the product.
- `docs/agents/DEBUGGING.md`: Common issues and diagnostics.

## Repo Map
- `apps/`: Application entrypoints (API, CLI, Scheduler, Web).
- `packages/`: Domain modules and shared libraries.
- `migrations/`: MariaDB schema migrations.
- `scripts/`: Dev, test, and Docker helpers.

## Available skills and location
Skills live in `.ai/skills/`:
- `.ai/skills/architecture.md`
- `.ai/skills/database.md`
- `.ai/skills/coding.md`
- `.ai/skills/test.md`
- `.ai/skills/readme.md`

## Orchestration
When work touches more than one area, use the skills in this order:
1) `.ai/skills/architecture.md`
2) `.ai/skills/database.md`
3) `.ai/skills/coding.md`
4) `.ai/skills/test.md`
5) `.ai/skills/readme.md`

## Global rules
- README: update `README.md` whenever a change affects setup, architecture, usage, dependencies, configuration, or commands.
- ADR: every technical or architectural decision must be recorded as an ADR in the `.adr/` folder using the corresponding template.
- Keep consistency with modular hexagonal architecture and MariaDB without ORM.
- Tests: every new feature or change must include unit and/or integration tests following `.ai/skills/test.md` guidelines.
- Language: UI copy and documentation must remain in English for consistency.
- Agent docs: update `docs/agents/INDEX.md` when adding or removing modules/apps, and keep module-level `AGENTS.md` files current.
