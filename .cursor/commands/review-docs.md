# Review Documentation

Analyze project documentation to identify outdated, duplicated, or erroneous content using parallel subagents.

## Objective

Detect documentation issues across the project and generate a consolidated report.

## Instructions

### Step 1: Launch parallel Explore subagents

Use Explore subagents to analyze each documentation area simultaneously:

1. **Subagent 1**: Analyze `docs/agents/` - agent-facing documentation (INDEX, DOCKER, ENVIRONMENT, DATABASE, GOLDEN_PATHS, DEBUGGING)
2. **Subagent 2**: Analyze `AGENTS.md` files - root and all modules in `apps/` and `packages/`
3. **Subagent 3**: Analyze `.ai/standards/` and `.ai/skills/` - project standards and skills
4. **Subagent 4**: Analyze `.adr/` - Architecture Decision Records

### Step 2: Verification checklist for each area

For each documentation file, verify:

- **Broken links**: Internal links pointing to non-existent files
- **Invalid references**: Mentions of code, functions, classes, or paths that don't exist
- **Duplicated content**: Information repeated across different files
- **Inconsistencies**: Contradictory information between documents
- **Outdated content**: Obsolete instructions, old versions, incorrect paths

### Step 3: Consolidate and report

Generate a consolidated report with findings from all subagents:

```text
## Documentation Review Report

### Summary
- Files analyzed: X
- Issues found: Y (Z critical, W minor)

### Critical Issues
1. [file:line] - Problem description
   - Evidence: ...
   - Recommendation: ...

### Minor Issues
1. [file:line] - Problem description

### General Recommendations
1. ...
```

## Documentation areas to analyze

| Area | Path | Description |
|------|------|-------------|
| Agent docs | `docs/agents/` | INDEX, DOCKER, ENVIRONMENT, DATABASE, GOLDEN_PATHS, DEBUGGING |
| Module docs | `*/AGENTS.md` | Root + apps/ + packages/ |
| Standards | `.ai/standards/` | Project standards (architecture, coding, database, test, commit, subagents) |
| Skills | `.ai/skills/` | Actionable procedures (each in its own folder with `SKILL.md`) |
| ADRs | `.adr/` | Architecture Decision Records |
| Main README | `README.md` | Project overview |

## Issue severity criteria

- **Critical**: Broken links, references to deleted code, incorrect commands that would fail
- **Minor**: Typos, outdated but non-breaking info, style inconsistencies, minor duplications
