# Standard: Coding

## Objective
Establish consistent TypeScript coding standards, with SOLID and maintainable quality.

## Scope
- TypeScript style and conventions.
- SOLID principles.
- Typing and error handling.
- Unit and use-case testing.

## Expected inputs
- Business rules or user stories.
- Input/output contracts (DTOs, ports).
- Quality criteria (lint, format, test).

## Expected outputs
- Domain and use-case implementations.
- Clear public types.
- Relevant tests.
- ADRs for design decisions or trade-offs.

## Recommended workflow
1) Define public types and contracts.
2) Implement logic in the domain with minimal dependencies.
3) Apply SOLID (SRP, OCP, LSP, ISP, DIP).
4) Handle errors with explicit types and consistent messages.
5) Write tests for critical rules and use cases.
6) Refactor for clarity and consistency.

## Best practices
- Avoid `any`; use `unknown` with type narrowing.
- Prefer pure functions in the domain.
- Use dependency injection in adapters/application.
- Names aligned with the business language.
- Document relevant decisions in `.adr/`.

## Checklist
- [ ] Code follows SOLID across classes and modules.
- [ ] Public types are defined and stable.
- [ ] No `any` without justification.
- [ ] Errors and results are handled consistently.
- [ ] Tests cover business rules and use cases.
