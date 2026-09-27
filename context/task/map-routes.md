# Improve map routes and performance

- **Monotask ID:** `9b683b46-6e77-46f9-8e7c-90c2e477629a`
- **Priority:** Medium
- **Status:** To do — definition synchronized
- **Category:** General
- **Depends on:** `path-finder.md`, `web-alt-and-accessibility.md`

## Source description

El mapa resulta poco fluido al hacer zoom y desplazarse. Los puntos pequeños y densos no permiten entender por dónde avanza el viajero. Al situar el cursor sobre el mapa, la rueda debe controlar su zoom en vez de desplazar la página. Cuando el zoom separa suficientemente las paradas, debe aparecer el nombre del lugar. Hay que eliminar el retardo de interacción mediante caché, carga previa y reducción de trabajo innecesario.

## Outcome

The public map presents the published journey as a clear chronological line with selectable stops, while remaining responsive during pan, zoom and search on mobile and desktop.

## Scope

- Render one ordered polyline joining published photo/route-point coordinates in journey sequence; segment breaks are explicit when coordinates are missing or a discontinuity is detected.
- Retain the existing SVG Natural Earth basemap, controls and selected-photo frame; do not add a new map library.
- Fetch a compact, ordered route geometry separately from viewport pins so the journey line is stable while pins remain viewport/search filtered.
- Simplify route geometry server-side for low zoom and render only the segment detail justified by the current zoom.
- Make the route, stops and current/latest stop visually distinguishable: render the route beneath pins, retain a perceptible minimum pin target, and give the selected/latest stop a clear visual treatment.
- Show place labels only above defined zoom thresholds and only where they can be placed without overlapping; hide or progressively reduce labels as density increases.
- While the pointer is over the map canvas, capture mouse-wheel and trackpad scrolling for map zoom with a non-passive listener so the page does not scroll. Outside the canvas, normal page scrolling remains unchanged.
- Reduce avoidable client work: debounce pan/zoom requests, cancel stale pin requests, deduplicate requests by rounded bounding box, query and locale, avoid saving unchanged map state, and cache the parsed basemap for the client session.
- Supply accessible zoom controls and a chronological stop list/equivalent navigation as defined by the accessibility task.

## Non-goals

- No road-accurate or navigation route and no interpolation across oceans.
- No tracking of unpublished or future points on the public map.
- No change to the journey-generation algorithm.

## Functional contract

- The route endpoint returns only published coordinates in stable journey/sequence order, with a small cacheable DTO independent of the pin viewport query.
- A map segment connects consecutive valid points of the same journey; the UI does not invent a connection over missing/invalid data.
- Pins remain capped and filtered by current bounding box/search; the route polyline does not change merely because the viewport changes.
- Label visibility is derived from the current zoom and available screen/projection space; label collision handling must not make pan or zoom perceptibly slower.
- Wheel events are prevented only while the map canvas is hovered and are handled by a listener explicitly registered as non-passive; keyboard-accessible controls remain the equivalent interaction.
- A request identity consists of the rounded bounding box, search query and locale. The client aborts superseded pin requests and does not refetch or persist an unchanged identity/state.
- The client handles endpoint failure by retaining pins/basemap and showing the map without a route line.

## Acceptance criteria

- A visitor can see and follow the ordered published journey and select an individual stop without losing current map context.
- At overview zoom, the route line, its stops and the selected/latest stop remain visually distinguishable even where stops are geographically close.
- The line is rendered correctly across the antimeridian and does not draw a misleading world-spanning segment.
- With the cursor over the map, wheel and trackpad movement zoom the map without scrolling the page; outside it, normal page scrolling is preserved.
- At defined zoom thresholds, non-overlapping place labels appear for sufficiently separated stops and hide progressively again as zoom/density requires.
- Pan/zoom remains responsive with the configured pin cap, and stale responses cannot replace newer viewport data or leave a stale loading state.
- Repeated movement inside an unchanged rounded bounding box, query and locale does not trigger redundant pin requests or state writes.
- The map works at the supported responsive breakpoints and offers keyboard/equivalent-list access.

## Implementation plan

1. Measure present pin/map-state requests, basemap parsing and render cost; define practical route-geometry, label-visibility and simplification thresholds from real data.
2. Add a read-only route-geometry port, MariaDB query and API/proxy endpoint using parameterized SQL and journey order.
3. Extract the map canvas rendering from `MapExplorer` where needed so pins, polyline and persistence/fetch behaviour are explicit props.
4. Project and split segments safely, render the route beneath perceptible pins, distinguish the current/latest stop, and add collision-aware labels plus chronological list/selection synchronisation.
5. Register scoped non-passive wheel handling for hovered map interaction; retain accessible controls and test normal page-scroll behaviour outside the canvas.
6. Introduce request cancellation/deduplication, unchanged-state persistence guards and session basemap caching; verify save/load behaviour with focused tests.

## Test plan

- Unit-test route ordering, missing-coordinate breaks, antimeridian splitting, zoom simplification and label visibility/collision decisions.
- Integration-test the read-only repository query with multiple journeys/statuses.
- Component-test route rendering, selected/latest stop treatment, label thresholds, scoped wheel zoom, stale-request handling and the no-route fallback.
- Manually profile pan/zoom and wheel interaction on a representative published dataset at mobile and desktop widths; record request counts and interaction latency before and after the change.

## Risks and decisions resolved

- The visual route is a chronological editorial trace, not a claim about the road actually travelled.
- A separate geometry query keeps map pins bounded and avoids loading all photo metadata just to draw a line.
- Wheel capture is intentionally scoped to hover over the map, so ordinary document navigation is not blocked elsewhere.
- Labels prioritise legibility over completeness at dense zoom levels; the equivalent chronological list remains the complete textual route.
