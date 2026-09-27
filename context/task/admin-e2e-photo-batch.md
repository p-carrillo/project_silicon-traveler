# Comando E2E de diez fotografías globales en Admin

- **Monotask ID:** `70182d20-ba67-416e-bc04-17ec09be223f`
- **Priority:** High
- **Status:** To do — definition synchronized
- **Category:** General
- **Depends on:** `admin-e2e-execution-foundation.md`

## Source description

Añadir una pestaña de prueba en Admin con un botón que genere diez fotografías y textos reales de diez lugares aleatorios del mundo. No se persisten en base de datos; deben mostrarse según terminan y usar el mismo flujo que los cron de la aplicación.

## Outcome

An authenticated development Admin user can launch one real, sequential batch of ten independent global photo generations, observe its live progress, and inspect each resulting image and narrative without changing production-like business data.

## Scope

- Add the `Fotos` tab to `/admin/e2e`.
- Present one explicit start button, provider-cost notice, overall progress bar (`0/10` through `10/10`), accessible live status, and a result card per completed item.
- Use the existing content LLM adapter to request a structured list of ten unique, globally distributed places. Do not add a geographic provider or a static city catalogue.
- For each selected place, run the shared ephemeral photo pipeline from the foundation task, sequentially and with real configured providers.
- Each card displays location, status, image, narrative, image prompt where available, relevant camera metadata, and a readable error state when that item fails.
- Results are client-session ephemeral: page reload, navigation away, or browser close clears the displayed batch. No retry, download, publication, route-point edit, or manual persistence is included in this task.

## Functional contract

- The LLM place-selection request returns exactly ten JSON-structured candidates with place name, country, and region when known; duplicates and malformed candidates are rejected before photo processing begins.
- The batch coordinator processes indices 1 through 10 in order. A failed item emits an `error` event, occupies its result slot, and does not prevent the next item from running.
- Each successful `result` event exposes a temporary authenticated image URL and the same user-facing prepared-photo fields produced by the shared production generation core.
- The client disables the start button for the active run, announces progress with `aria-live`, and preserves completed cards while later items run.

## Acceptance criteria

- One click starts a batch of ten real generations and visibly advances progress as items finish.
- Every successful card contains the generated image and narrative for one of the LLM-selected places.
- No `journey`, `route_points`, `route_point_translations`, `photos`, `map_state`, or persistent image files are created or changed by the batch.
- The implementation does not recreate research, content, translation, image, thumbnail, or error-handling business logic in web code or a parallel E2E service.
- A single provider or place failure is reported on its card and the remaining places continue.
- The tab and all supporting routes are inaccessible outside development.

## Implementation plan

1. Extend the existing LLM port and adapter with a narrowly typed place-selection operation; request structured, globally varied place candidates and validate the returned value as `unknown` before use.
2. Build an ephemeral batch use case that validates ten unique places, invokes the shared production photo-generation core once per place, and maps outcomes to the common event DTOs.
3. Add the streamed Admin endpoint and the protected web proxy from the foundation task.
4. Build a small client component inside the server-rendered E2E page for start handling, streamed-event parsing, progress, cards, and errors. Keep all labels in translation keys.
5. Use the temporary image endpoint rather than permanent storage or a database-backed photo URL.

## Test plan

- Unit-test validation of structured LLM output, duplicate handling, and ten-item sequencing.
- Unit-test continuation after an item failure and the event payloads for success and error.
- Test the component’s initial, active, partial-success, partial-failure, complete, and unavailable states.
- Exercise one real development batch manually only with explicitly configured provider credentials; confirm the database and persistent image directory remain unchanged.

## Risks and decisions resolved

- The command intentionally incurs real LLM and image-generation cost; the UI must make this clear before launch.
- The LLM is the sole source of random places for this command. A bad list is a visible preflight failure, not a fallback to a new provider or catalogue.
- Generated images may be large; the ephemeral asset store must enforce the memory and TTL limits established by the foundation task.
