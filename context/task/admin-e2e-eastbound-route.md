# Comando E2E de inspección de ruta hacia destino en Admin

- **Monotask ID:** `db281ee6-19f3-4c75-a257-446300128e3f`
- **Priority:** High
- **Status:** To do — definition synchronized
- **Category:** General
- **Depends on:** `admin-e2e-execution-foundation.md`, `path-finder.md`

## Source description

Añadir una pestaña de prueba que trace una ruta en el mapa desde un origen elegido, iterando el flujo real del viajero hacia un destino configurado. La ruta se muestra en el mismo estilo de mapa de la aplicación y no persiste datos.

## Outcome

An Admin development user can enter an origin and destination, select one to ten iterations, and inspect the exact sequence of proposed stops that production would calculate, rendered as an in-memory polyline on the existing map presentation.

## Scope

- Add the `Ruta` tab to `/admin/e2e`.
- Accept origin and destination as free text, geocode both with the existing place-geocoding use case, and reject unresolved values with a clear inline error.
- Offer an iteration selector from 1 to 10, defaulting to 10.
- Starting at the resolved origin, invoke the shared destination-led next-stop operation once per iteration. Each returned stop becomes the origin of the next iteration until arrival or a typed failure.
- Stream progress and stop results so the route grows progressively; produce an ordered polyline consisting of the origin and every successful stop.
- Reuse the existing SVG world-map presentation by extracting its rendering and interaction layer into a side-effect-free map component that receives markers and optional polyline data as props.
- Do not query, add, update, or display persisted journey/photo pins for this command. Do not save map viewport state, create route points, or update the active journey position.

## Functional contract

- Input: `{ originQuery: string, destinationQuery: string, iterations: 1..10 }`.
- Output events include the resolved origin followed by each successful or failed iteration, with order, coordinates, city/place data, and a final completion summary.
- The shared planning operation retains the current production behavior: destination bearing, approximately 20 km candidate step, multi-candidate settlement lookup, land-continuity/coast handling, geocoding, and place-coordinate adjustment. This task does not add road routing, a new provider, or a parallel path-finding algorithm.
- The map receives a polyline only from successful stops; a failed iteration or arrival is shown in the list and ends the dependent chain because no next origin is needed or available.

## Acceptance criteria

- A valid origin, destination and iteration count draws an ordered route through the calculated destination-directed cities.
- Every step is produced by the exact shared operation used by production preparation; there is no parallel calculation in the Admin API or browser.
- The visible map uses the same projection, basemap style, zoom controls, and interaction model as the public map, but persists no map state and fetches no production photo pins.
- The list and map update while the run is active and identify each computed city and its coordinates.
- Invalid origin, geocoding failure, city lookup failure, and unexpected upstream error are clearly reported without writes to MariaDB or permanent storage.
- The tab and endpoints return `404` outside development.

## Implementation plan

1. Add an ephemeral route-run use case that resolves the textual origin and destination and loops over the shared next-stop operation, carrying the returned coordinates forward in memory only.
2. Emit the common E2E events for origin resolution, each iteration, failure, and completion through the foundation stream endpoint.
3. Split `MapExplorer` so a reusable visual map canvas accepts markers, optional route polyline, and explicitly controlled state-saving/pin-loading behavior; preserve the existing public-map wrapper unchanged.
4. Build the Route tab client island with origin form, 1–10 selector, streamed-progress handling, stop list, error state, and map props.
5. Add translation keys and responsive/accessibility treatment for form controls, map status, markers, and route errors.

## Test plan

- Unit-test the ephemeral route runner with deterministic fake calculation/geocoding ports, including coordinate chaining and failure termination.
- Test that the production and E2E callers invoke the same next-stop service.
- Test map-canvas rendering with a polyline and markers, and confirm E2E mode makes no map-state save or pin-fetch request.
- Test origin/destination validation, iteration bounds, streamed partial results, arrival, coast outcomes, upstream failures, and development-only access.
- Manually compare an E2E step with the same production next-stop flow using identical controlled ports to confirm the sequence contract.

## Risks and decisions resolved

- The candidate projection may be stochastic; the E2E command validates the production flow, not repeatable coordinates. Deterministic fakes are used only in automated tests.
- Because the next iteration requires a valid city coordinate, a failed step ends that route run rather than fabricating a continuation.
- This task intentionally does not alter `path-finder.md`; future production changes automatically affect the E2E command through the shared operation.
