# Standard: Subagents

## Objective

Provide patterns for using subagents effectively in this project.

## Scope

- Built-in subagents (Explore, Bash, Browser)
- When to use subagents vs skills
- Parallel execution patterns
- Custom subagent creation

## Built-in Subagents

| Subagent | Purpose | Use when... |
|----------|---------|-------------|
| Explore | Search and analyze code | Extensive codebase exploration needed |
| Bash | Execute shell commands | Commands produce verbose output |
| Browser | Interact with browser | UI testing via MCP tools |

### Why These Exist

These operations share common traits:
- Generate noisy intermediate output
- Benefit from specialized prompts and tools
- Can consume significant context

Running them as subagents provides:
- **Context isolation**: Intermediate output stays in subagent, parent sees final summary
- **Model flexibility**: Explore uses faster model, enabling parallel searches
- **Cost efficiency**: Faster models cost less for token-heavy exploration

## Decision: Subagent vs Skill

**Use Subagent when:**
- Task generates significant intermediate output
- Context isolation is needed
- Independent tasks can run in parallel
- Exploration is extensive and would consume main context

**Use Skill when:**
- Task is simple and repeatable
- Completes in a single shot
- No separate context window needed

## Workflow

1. Identify if task requires context isolation
2. Select appropriate subagent (built-in or custom)
3. Define prompt with ALL necessary context (subagents have NO history access)
4. Launch in parallel when tasks are independent
5. Process and consolidate results

## Parallel Execution Pattern

When multiple independent areas need analysis:

```
Agent receives task
├── Launch Subagent 1: Area A
├── Launch Subagent 2: Area B
├── Launch Subagent 3: Area C
└── Launch Subagent 4: Area D
    ↓ (parallel execution)
Consolidate results from all subagents
Generate unified report
```

## Custom Subagents

Custom subagents can be created as markdown files. Check your IDE documentation for the recommended location:

```yaml
---
name: subagent-name
description: "Description of when to use this subagent"
---

# Subagent Instructions

[Detailed instructions for the subagent]
```

Custom subagents are useful for:
- Domain-specific verification tasks
- Specialized code review patterns
- Project-specific workflows

## Best Practices

- Subagents have NO access to conversation history
- Include ALL necessary context in the initial prompt
- Use parallel execution for independent tasks
- Prefer subagents for extensive codebase exploration
- Consolidate results from multiple subagents in the parent agent
- Keep subagent prompts focused on a single responsibility

## Checklist

- [ ] Does the task require context isolation?
- [ ] Are there independent parallelizable tasks?
- [ ] Does the prompt include all necessary context?
- [ ] Is the appropriate subagent selected?
- [ ] Is consolidation strategy defined for multiple subagents?
