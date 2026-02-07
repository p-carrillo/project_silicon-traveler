# ADR 037: DockShield Audit Skill Location

**Status:** Reverted  
**Date:** 2026-02-05  
**Reverted:** 2026-02-06

## Reversion Reason
After review, we decided to keep the Docker security audit skill in `.ai/skills/docker-security-audit.md` alongside other skills for consistency. The separation was deemed unnecessary complexity.  

## Context
We want a clearer separation between agent-facing documentation in `docs/agents/` and operational skills. The Docker security audit skill was stored alongside core `.ai/skills/` guidance, which made it feel like there were two agent-doc roots. We also decided to remove the obsolete `.ai/skills/readme.md` skill stub.

## Decision
- Move the Docker security audit skill to the repo root under `dockshield-audit/` and rename the skill to `dockshield-audit`.
- Remove `.ai/skills/readme.md` and keep README update rules in `AGENTS.md`.

## Alternatives considered
- Keep the Docker security audit skill under `.ai/skills/`.
- Move all agent docs into `.ai/` instead of `docs/agents/`.

## Consequences
### Positive
- Clearer separation between core agent docs and specialized skills.
- A distinct, easy-to-discover location for the Docker security audit skill.

### Negative
- Tooling and prompts must update to the new skill name and path.

### Follow-ups
- Update documentation references to the new location and name.
