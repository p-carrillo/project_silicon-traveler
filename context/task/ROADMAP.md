# Recommended implementation roadmap

This roadmap is an implementation-order guide, not a Monotask task and not a status tracker. Individual task documents remain the source of truth for scope, dependencies, acceptance criteria and synchronization state.

## Principles

- Complete foundational route and accessibility work before dependent public-map or editorial work.
- Keep the first research iteration deliberately small: Wikipedia summary plus existing OSM context, safe fallback and compact persistence.
- Establish the Admin workspace and its development-only diagnostic tools early, so each subsequent production change can be exercised through its real flow before the next feature starts.
- Defer external operational integrations until public assets, publication semantics and editorial review are stable.

## Recommended order

1. [Navegación lateral del panel de administración](admin-navigation-shell.md) — creates the common Admin workspace for dashboard, point creation, and diagnostic tools.
2. [Base de ejecuciones E2E efímeras para Admin](admin-e2e-execution-foundation.md) — provides development-only, shared-flow diagnostics without persistent data.
3. [Comando E2E de diez fotografías globales en Admin](admin-e2e-photo-batch.md) — makes the editorial pipeline observable through a bounded real batch.
4. [Destination-led journey route planner](path-finder.md) — establishes the production itinerary and the shared operation inspected by the route diagnostic.
5. [Comando E2E de inspección de ruta hacia destino en Admin](admin-e2e-eastbound-route.md) — exposes the completed planner in Admin for iterative verification.
6. [Strengthen place research and editorial evidence](place-research-evidence.md) — implements the lightweight first version before its editorial consumers.
7. [Improve editorial text variety and place specificity](improve-text.md) — first consumer of structured place evidence and the most contained editorial improvement.
8. [Improve image variety and editorial direction](image-variety-and-editorial-direction.md) — builds visual direction on the same evidence contract.
9. [Manual editorial replacement and image-prompt preview](manual-photos-and-image-prompt.md) — completes the remaining Admin workflow once its visual-brief dependency is available.
10. [Web accessibility and alternative text](web-alt-and-accessibility.md) — applies the shared accessibility baseline across public and Admin flows.
11. [Improve map routes and performance](map-routes.md) — makes the new journey legible and responsive on the public site.
12. [Editorial publishing to Instagram](instagram.md) — external integration last, after public image hosting, publication semantics and editorial decisions have proven stable.

## Deliberate sequencing decisions

- The E2E foundation is deliberately scheduled early as development tooling. It must continue to call extracted production operations so it validates each change rather than becoming a parallel implementation.
- The manual editorial Admin workflow remains after image direction because it consumes the persisted visual-brief contract; moving its UI earlier would either block on or duplicate that dependency.
- The research task does not need to become a multi-provider platform in its first delivery. Its bounded first version is sufficient to give text and image generation reliable place-specific inputs.
- Instagram remains manually confirmed and operationally gated; it should not set the pace for the core journey, map or editorial work.
