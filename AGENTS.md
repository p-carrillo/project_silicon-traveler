# AGENTS

This repo is a Node.js + TypeScript monorepo with a modular hexagonal architecture and MariaDB without an ORM (direct SQL and connections). The codebase follows the most widely adopted TypeScript standard and applies SOLID.

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
