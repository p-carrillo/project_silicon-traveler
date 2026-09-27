# Navegación lateral del panel de administración

- **Monotask ID:** Pending approval for synchronization
- **Priority:** Medium
- **Status:** To do — local definition, not synchronized
- **Category:** General
- **Depends on:** `admin-e2e-execution-foundation.md` only for the E2E destination

## Source description

El panel de administración actual concentra el listado de puntos, la creación de puntos y las futuras pruebas E2E sin una navegación común. Se necesita una estructura de aplicación con un menú lateral que mantenga el dashboard actual y dé acceso claro a las demás herramientas.

## Outcome

All authenticated Admin routes render inside a responsive Admin shell. Its lateral navigation exposes Dashboard, Create route point, and—only in development once the E2E foundation is available—E2E tests. Editors can move between tools without returning to an ambiguous all-in-one page, while existing list, edit, creation, sign-out, and authorization behaviour remain intact.

## Scope

- Create a shared Admin shell for authenticated `/admin` routes, excluding `/admin/login`.
- On desktop, show a persistent semantic lateral navigation with the product/admin identity, navigation actions, the active destination, and sign-out.
- Keep the current route-point list at `/admin` as the Dashboard; preserve its filters, pagination, success notices, edit links, and data contract.
- Include navigation actions for:
  - `Dashboard` → `/admin`
  - `Create route point` → `/admin/route-points/new`
  - `E2E tests` → `/admin/e2e`, only when development mode permits the E2E feature.
- Use the same shell for route-point creation and editing, so navigation and sign-out are not duplicated per page.
- Make the navigation responsive: the sidebar remains usable without horizontal overflow at narrow widths, with a compact accessible alternative appropriate for mobile.
- Put all new visible labels in the translation catalog and retain the Admin no-index metadata.

## Non-goals

- This task does not implement the E2E foundation, its commands, or `/admin/e2e`; that destination is owned by `admin-e2e-execution-foundation.md` and must remain absent outside development.
- It does not change Admin authentication, roles, route-point data, or the public-site navigation.
- It does not redesign the dashboard tables/forms beyond the layout and navigation needed to host them.

## Acceptance criteria

- Authenticated visitors see the existing route-point dashboard at `/admin` inside the shared Admin shell.
- The lateral navigation visibly identifies the current section and links to Dashboard and route-point creation.
- In development, after `/admin/e2e` exists, the shell shows one E2E tests link; in production it neither renders that link nor makes E2E reachable.
- The create and edit pages use the same shell and retain their existing submit, cancellation, deletion, upload, validation, redirect, and sign-out behaviour.
- At 320, 768, 1024, and 1440 px, keyboard users can reach every navigation action, focus remains visible, targets are practical on touch devices, and there is no horizontal page overflow.
- New UI text is translated; Admin pages remain non-indexable.

## Implementation plan

1. Inventory the authenticated Admin route tree and extract the duplicated top-bar, container, and sign-out composition into a route-level shell.
2. Add a small navigation component with typed destinations and pathname-based active state, keeping interactivity at the smallest possible client boundary.
3. Move the current list page into the Dashboard content area and adapt the new/edit pages to render only their page-specific headings and content.
4. Centralize the development-only E2E visibility guard with the guard introduced by the E2E foundation; render no speculative route or link before that task supplies it.
5. Add translation keys and focused component/route tests for navigation destinations, active state, development gating, responsive semantics, and preservation of existing Admin flows.

## Test plan

- Add focused tests for the navigation model, active-state selection, and development-only E2E visibility.
- Update existing Admin page tests to assert the shared shell without coupling them to presentation-only markup.
- Run the affected web Vitest tests and ESLint inside the Docker app container.
- Manually verify desktop and mobile keyboard navigation for dashboard, creation, editing, and sign-out.

## Risks and decisions resolved

- The E2E entry must not create a production-facing affordance or imply that the future route is available; its shared guard is the source of truth.
- A route-level shell avoids markup drift between dashboard, creation, and editing while preserving server-rendered page data fetching and server actions.
- On small screens, a collapsible or horizontal navigation alternative is acceptable; retaining a squeezed permanent desktop sidebar is not required when it harms usability.
