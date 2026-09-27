# Recommended implementation roadmap

This roadmap is an implementation-order guide, not a Monotask task and not a status tracker. Individual task documents remain the source of truth for scope, dependencies, acceptance criteria and synchronization state.

## Principles

- Complete foundational route and accessibility work before dependent public-map or editorial work.
- Establish the Admin workspace and its development-only diagnostic tools early, so each subsequent production change can be exercised through its real flow before the next feature starts.
- Defer external operational integrations until public assets, publication semantics and editorial review are stable.

## Recommended order

1. ✅ [Navegación lateral del panel de administración](admin-navigation-shell.md) — completed; provides the common Admin workspace for dashboard and point creation.
2. ✅ [Base de ejecuciones E2E efímeras para Admin](admin-e2e-execution-foundation.md) — completed; provides development-only, shared-flow diagnostics without persistent data.
3. ✅ [Comando E2E de diez fotografías globales en Admin](admin-e2e-photo-batch.md) — completed; makes the editorial pipeline observable through a bounded real batch.
4. [Destination-led journey route planner](path-finder.md) — establishes the production itinerary and the shared operation inspected by the route diagnostic.
5. [Comando E2E de inspección de ruta hacia destino en Admin](admin-e2e-eastbound-route.md) — exposes the completed planner in Admin for iterative verification.
6. ✅ [Improve editorial text variety and place specificity](improve-text.md) — completed; adds research-backed place details, rotating narrative modes, and recent-entry repetition checks.
7. [Improve image variety and editorial direction](image-variety-and-editorial-direction.md) — builds visual direction on available place and route context.
8. [Manual editorial replacement and image-prompt preview](manual-photos-and-image-prompt.md) — completes the remaining Admin workflow once its visual-brief dependency is available.
9. [Web accessibility and alternative text](web-alt-and-accessibility.md) — applies the shared accessibility baseline across public and Admin flows.
10. [Improve map routes and performance](map-routes.md) — makes the new journey legible and responsive on the public site.
11. [Editorial publishing to Instagram](instagram.md) — external integration last, after public image hosting, publication semantics and editorial decisions have proven stable.
## Deliberate sequencing decisions

- The E2E foundation is deliberately scheduled early as development tooling. It must continue to call extracted production operations so it validates each change rather than becoming a parallel implementation.
- The manual editorial Admin workflow remains after image direction because it consumes the persisted visual-brief contract; moving its UI earlier would either block on or duplicate that dependency.
- Instagram remains manually confirmed and operationally gated; it should not set the pace for the core journey, map or editorial work.
