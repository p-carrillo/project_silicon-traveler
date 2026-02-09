# AGENTS

## Repository Summary
This repo is a Node.js + TypeScript monorepo with a modular hexagonal architecture and MariaDB without an ORM (direct SQL and connections). The codebase follows the most widely adopted TypeScript standard and applies SOLID.

## Agent Documentation
- `docs/agents/INDEX.md`: Entry point for agent-facing documentation.
- `docs/agents/DOCKER.md`: Docker deployment and operations guide.
- `docs/agents/ENVIRONMENT.md`: Environment variables and defaults.
- `docs/agents/DATABASE.md`: Database schema overview and migrations.
- `docs/agents/GOLDEN_PATHS.md`: End-to-end flows for the product.
- `docs/agents/DEBUGGING.md`: Common issues and diagnostics.

## Repo Map
- `apps/`: Application entrypoints (API, CLI, Scheduler, Web).
- `packages/`: Domain modules and shared libraries.
- `migrations/`: MariaDB schema migrations.
- `scripts/`: Dev, test, and Docker helpers.

## Project standards
Standards live in `.ai/standards/` (IDE-agnostic). Always consult them before making changes:
- `.ai/standards/architecture.md`: Hexagonal architecture, layers, ports, and dependency rules.
- `.ai/standards/coding.md`: TypeScript conventions, SOLID, typing, and error handling.
- `.ai/standards/database.md`: MariaDB without ORM, pooling, repositories, and migrations.
- `.ai/standards/test.md`: Vitest strategy, test structure, patterns, and coverage goals.
- `.ai/standards/commit.md`: Conventional Commits format, types, scopes, and rules.
- `.ai/standards/subagents.md`: Patterns for using subagents effectively.

When work touches more than one area, follow standards in this order:
1) `.ai/standards/architecture.md`
2) `.ai/standards/database.md`
3) `.ai/standards/coding.md`
4) `.ai/standards/test.md`

## Available skills
Skills are actionable procedures. Each skill lives in its own folder with a `SKILL.md` file:
- `.ai/skills/docker-security-audit/SKILL.md`: Docker security audit workflow.

## IDE-specific configuration
- **Cursor**: `.cursor/rules/` (rules), `.cursor/commands/` (commands).
- **GitHub Copilot**: `.github/copilot-instructions.md`.

Both redirect to this file as the single entry point.

## Global rules
- README: update `README.md` whenever a change affects setup, architecture, usage, dependencies, configuration, or commands.
- ADR: every technical or architectural decision must be recorded as an ADR in the `.adr/` folder using the corresponding template.
- Keep consistency with modular hexagonal architecture and MariaDB without ORM.
- Tests: every new feature or change must include unit and/or integration tests following `.ai/standards/test.md` guidelines.
- Language: UI copy and documentation must remain in English for consistency.
- Agent docs: update `docs/agents/INDEX.md` when adding or removing modules/apps, and keep module-level `AGENTS.md` files current.
