# Base de ejecuciones E2E efímeras para Admin

- **Monotask ID:** `0d5e5e38-b6b2-4b79-b345-767975f3230d`
- **Priority:** High
- **Status:** To do — definition synchronized
- **Category:** General

## Source description

Crear en el panel de administración una suite de pruebas E2E reales para desarrollo. Los comandos deben usar exactamente los mismos flujos de producción que el cron, sin duplicar lógica y sin persistir datos de prueba. La suite debe quedar deshabilitada en producción.

## Outcome

Provide a reusable development-only execution layer that can run production pipeline flows with temporary inputs and emit incremental progress to the Admin UI. It must never create or update journey, route-point, photo, translation, map-state, or permanent image-storage records.

## Scope

- Create the common foundation used by every Admin E2E command; it is not a public feature and is available only in development.
- Extract the existing production operation that plans the next destination-led stop: project toward the active destination, locate and score nearby cities, validate land continuity, geocode, and apply the final place-coordinate adjustment.
- Keep the scheduler and CLI on that same extracted operation. This task must not replace, redesign, or introduce a new path-finding algorithm.
- Extract the reusable core of photo preparation so production persistence and ephemeral E2E execution share research, LLM content generation, translations, image generation, image download, and thumbnail generation.
- Introduce ephemeral implementations for route-point state and generated assets. They may use process memory only for the active browser session and must not write to MariaDB, `/app/images`, or another durable store.
- Expose development-only streamed execution endpoints under the API Admin namespace and authenticated web proxies under `/admin/api/e2e`.
- Add `/admin/e2e` as the single Admin entry point for current and future commands. The Admin home exposes one `Pruebas E2E` menu action only in development.

## Functional contract

- A shared next-stop use case accepts an in-memory origin position and active itinerary destination, then returns the enriched stop data needed by both production and E2E callers.
- An ephemeral execution emits ordered events: `started`, `progress`, `result`, `error`, and `completed`. Event payloads are JSON-safe, include an item index and total, and never contain secrets.
- Streaming uses an HTTP `text/event-stream` response consumed with `fetch`; it supports progressive results from a POST request.
- Temporary image assets are addressed through authenticated E2E asset URLs backed by in-memory buffers. They are removed when the run ends, is abandoned, or reaches a short bounded TTL. Reloading the page does not restore an E2E run.
- Each browser session may have one active E2E run. Starting a second run while one is active returns a clear conflict error rather than invoking paid providers concurrently.
- The web page, its proxy routes, the API endpoints, and temporary asset endpoints return `404` unless `NODE_ENV === 'development'`. Production must neither reveal the menu nor leave a callable endpoint.

## Acceptance criteria

- The scheduler, CLI preparation command, and Admin E2E commands call the same next-stop and photo-generation cores; no E2E copy of their business logic exists.
- An E2E execution performs no SQL writes and calls no permanent storage adapter.
- A connected Admin client receives progress and individual results before the batch completes.
- Closing or reloading the E2E page leaves no recoverable run in the UI and no durable business data.
- All E2E routes are unavailable with a `404` in production configuration, including direct API access.
- The existing production scheduler, CLI, public map, and Admin route-point management retain their current behavior.

## Implementation plan

1. Identify the persistence boundaries currently embedded in `PrepareNextPhotoUseCase` and `PreparePhotoUseCase`; extract stable application services that accept ports rather than database-bound entities.
2. Make scheduler and CLI composition instantiate those services with the current MariaDB, storage, research, LLM, image, thumbnail, and geocoding adapters.
3. Implement in-memory route and asset adapters exclusively for the E2E orchestration service, with cleanup and bounded resource limits.
4. Define event DTOs and the run coordinator, including sequential execution, error isolation, cancellation on client disconnect, and the one-active-run rule.
5. Add the API stream and temporary asset handlers, followed by same-origin Next.js Admin proxy handlers so browser clients never receive internal credentials.
6. Add the development guard in one shared location and apply it to menu rendering, page rendering, web proxies, API handlers, and asset handlers.
7. Create the empty tab shell at `/admin/e2e`; subsequent command tasks populate it.

## Test plan

- Unit-test the extracted next-stop and photo-generation cores with fake ports.
- Assert that production composition and E2E composition invoke the same application services.
- Test event order, partial failure continuation, single-active-run conflict, in-memory asset cleanup, and the absence of persistence-port calls.
- Test `404` behavior for every E2E page and endpoint outside development.
- Test that the Admin menu link is rendered only in development.

## Risks and decisions resolved

- Real provider calls can be slow and paid; the coordinator is sequential and reports each item as it completes.
- Server-memory assets are deliberately short-lived and bounded; they are not a cache or replacement for production storage.
- The suite is a manual, real-system E2E tool inside Admin, not a browser automation framework and does not introduce Playwright or another production dependency.
