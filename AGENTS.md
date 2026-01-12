# AGENTS.md

## Project goal
Minimal monorepo boilerplate with Next (client) and Nest (server). Shows an "It works" page and a basic health check.

## AI Context
- Check `.ai/skills/` for specific workflows and conventions.
- Check `.ai/specs/` for feature specifications.
- Check `docs/architecture/` for architecture documentation.
- Check `docs/adr/` for architectural decision records.
- Check `docs/specs/` for spec templates and reusable agent prompts.

## Architecture
- Monorepo: /client (Next) and /server (Nest)
- Client fetches /health from the server
- Docker Compose runs both services

## Commands
### Requirements
- Docker

### Setup
- docker compose up --build

### Dev
- docker compose up --build

### Build
- docker compose build

### Docker
- docker compose up --build

### Quality
- docker compose exec server pnpm lint
- docker compose exec server pnpm test
- docker compose exec client pnpm lint
- docker compose exec client pnpm test

Note: lint and test are minimal placeholders; replace with real checks when you add features.

## Fresh clone notes
- The project is Docker-only for development and testing.
- Use `docker compose up --build` for the full stack.
- To re-apply DB fixtures: `docker compose exec server pnpm db:fixtures`.

## Conventions
- **All code MUST be in English**: Variable names, function names, comments, documentation, commit messages, etc. Even if the user communicates in another language, all code artifacts must be in English.
- Server controllers should be thin; put logic in services.
- Keep API changes in sync with client usage.
- Tests must be located inside each module's `test/` folder, following the module's directory structure.
- One `.spec.ts` file per class/file being tested.

## Change workflow (SDD)
- **Specification Driven Development**: All changes must align with specs in `.ai/specs/` and documentation in `docs/`
- **Never silently override**: Do not modify specs/docs without explicit user approval
- **Documentation sync**: After code changes, verify that relevant updates are reflected in `docs/` and `.ai/` (specs/skills). If not, synchronize the documentation/specs in the same change set.
- Prefer small, focused changes.
- Keep Docker healthy after updates.

## Security
- Do not commit secrets.
- Avoid logging sensitive data.

## If something is missing
- Check README first, then ask for clarification.
