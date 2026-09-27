# Destination-led journey route planner

- **Monotask ID:** `833bb90c-89a8-4ef0-b2c5-1c964dc1a3c5`
- **Priority:** High
- **Status:** In progress — definition synchronized
- **Category:** General

## Source description

Implementar el algoritmo de path finding.

## Outcome

The journey follows a configured, global itinerary of named destinations. For each current position, the system proposes the next credible populated stop that makes measured progress toward the active destination, handles necessary water crossings explicitly, and advances to the next destination on arrival. Direction is derived solely from the active destination, not from a fixed eastbound rule. Its result is reproducible under a supplied random source and carries enough place data for the existing research and photo pipeline.

## Scope

- Replace the duplicated CLI/scheduler orchestration of coordinate calculation, nearby-place lookup, reverse geocoding, and place-coordinate adjustment with one `PlanNextStop` application use case in `@silicon-traveler/route`.
- Model a versioned itinerary as ordered named destination points and declared leg types. The initial editorial route begins Oleiros → Madrid → Málaga → Barcelona → Paris → London and completes the first world circuit described below; future entries can connect capitals and other approved global destinations without a code change.
- Resolve and validate every itinerary destination before a journey starts. Persist only the active destination index/identity required to resume the journey; keep the itinerary definition in versioned application configuration until a future editorial-management task requires UI editing.
- From the current position, calculate the bearing to the active destination, project an approximately 20 km candidate, find eligible city/town/village candidates within 20 km of that candidate, and select the one that most reduces geodesic distance to the destination.
- Reject candidates that do not make forward progress, create an implausible backward detour, or cross sea, ocean, lake, reservoir, or another water-only gap.
- When the active destination is inside the configured arrival radius, resolve it as the final stop, advance the active destination index, and continue the next planning run toward the following destination.
- Validate inputs and return a typed outcome for a usable stop, no nearby settlement, invalid place data, and upstream-provider failure.
- Use the resolved settlement coordinate as the following origin; preserve its name, region, country and available OSM data.
- Let CLI, scheduler and future Admin E2E route inspection call the same public use case.

## Proposed first world itinerary

The itinerary is a destination sequence, not a sequence of published photos. The planner creates its own approximately 20 km settlement stops between these editorial waypoints.

| Order | Destination | Segment into destination |
| --- | --- | --- |
| 1–6 | Oleiros → Madrid → Málaga → Barcelona → Paris → London | Land, with a short Channel transfer where required |
| 7–13 | Amsterdam → Berlin → Warsaw → Moscow → Volgograd → Tbilisi → Baku | Land |
| 14–19 | Tehran → Islamabad → New Delhi → Kathmandu → Dhaka → Bangkok | Land |
| 20–26 | Phnom Penh → Ho Chi Minh City → Hanoi → Beijing → Seoul → Tokyo → Osaka | Land plus a declared short maritime transfer into Japan where required |
| 27–30 | Darwin → Canberra → Sydney → Wellington | Air transfer from Osaka to Darwin, then land |
| 31–37 | Ushuaia → Punta Arenas → Santiago → Lima → Quito → Bogotá → Panama City | Air transfer from Wellington to Ushuaia, then land; the American corridor starts in the south and advances north |
| 38–44 | San José → Managua → Guatemala City → Mexico City → Los Angeles → San Francisco → Seattle | Land; continuous northbound progression through Central and North America |
| 45–49 | Vancouver → Calgary → Winnipeg → Toronto → New York | Land; predominantly north/east through Canada, then a final Atlantic departure point |
| 50–56 | Dakar → Bamako → Ouagadougou → Accra → Lagos → Yaoundé → Kinshasa | Air transfer from New York to Dakar, then land through west and central Africa |
| 57–62 | Lusaka → Harare → Johannesburg → Cape Town → Nairobi → Addis Ababa | Land through southern Africa; declared air transfer from Cape Town to Nairobi, then land |
| 63–70 | Khartoum → Cairo → Tunis → Algiers → Rabat → Tarifa → Lisbon → Oleiros | Land through east and north Africa, then a declared Strait of Gibraltar transfer to Tarifa followed by land |

Each destination is stored with its geocoded coordinates at itinerary-version creation time. A later edit changes a new itinerary version rather than moving an active destination underneath an existing journey.

## Non-goals

- No road-level turn-by-turn route, traffic, visa/border rules, or travel-time estimates; land legs remain geodesic settlement hops.
- No arbitrary worldwide search for a pretty location: every normal step must make measurable progress toward the active destination.
- No Admin itinerary editor in this task.
- No retroactive change to published journey history. An additive journey-state migration is permitted only for the itinerary version and active destination index needed to resume safely.

## Functional contract

- Input: origin coordinates, active destination, step distance (20 km), city-search radius (20 km), arrival radius, maximum attempts, itinerary version/index, and injected random-number source. There is no cardinal-heading input.
- A valid land-leg result contains candidate coordinates, resolved place coordinates, place name, optional region/country, OSM tags, active destination, and distance-to-destination before/after the step.
- The use case resolves an arrival first; otherwise it calculates the destination bearing, finds multiple nearby settlements, removes non-progressing candidates, validates land continuity, and deterministically scores the remaining candidates by forward progress and distance from the 20 km candidate.
- Before returning a land-leg settlement, a `LandContinuityPort` samples the segment at a bounded interval and confirms every sample is land using OpenStreetMap/Nominatim-derived land-or-water classification. The adapter hides provider-specific response shapes behind this port.
- If a direct land candidate is unavailable because water blocks the bearing, the planner enters a typed `approach_coast` outcome: it selects the closest reachable coastal settlement that still improves the destination bearing, then resumes normal land-leg planning from there.
- On a declared `maritime_transfer` or `air_transfer`, the planner validates the named transfer destination, emits a typed transfer result, advances the itinerary index, and begins normal land planning only after arrival. It never tries to generate 20 km land stops over water.
- Exhausting land attempts returns a typed `no_land_connected_stop`; callers never publish a water point or silently chain from an unknown point.
- Arriving at the final itinerary destination returns `itinerary_complete` rather than selecting a new arbitrary heading.
- The production composition uses `Math.random`; tests inject a deterministic source.

## Acceptance criteria

- Scheduler, CLI and Admin E2E route inspection share one destination-led operation; none contains its own copy of the sequence.
- Concurrent scheduler, CLI, or Admin actions cannot plan/persist two different next stops for the same active itinerary position; advancing a destination is atomic and idempotent.
- With a fixed random source and fake geographic ports, the same input yields the same result.
- Valid land legs reduce distance to the active destination and retain a city/town/village coordinate and label.
- The proposed Oleiros → … → Moscow → … → Ushuaia → … → New York → Dakar → … → Rabat → Lisbon → Oleiros circuit progresses in its declared order; reaching each configured destination selects the next one.
- Maritime and air transfers are visible, typed itinerary events rather than normal city-to-city land steps.
- A stop on the opposite side of a water body is not selected as a normal land leg, while a normal land route near a coastline remains eligible.
- Invalid ranges, invalid coordinates, absent settlements, geocoding failures, and malformed provider data have explicit, safe outcomes.
- Existing journey, photo preparation and publication behaviour remains unchanged after callers are rewired.

## Implementation plan

1. Define and validate the versioned initial itinerary, typed land/maritime/air legs, destination resolution, arrival radius and persistence model for the active index.
2. Map the duplicated portions of `init-journey`, `prepare-prompts`, `publish-seed-point`, and the scheduler against the current route use cases.
3. Define pure request/result DTOs and geographic ports, including multi-candidate settlement search and `LandContinuityPort`; keep random selection injectable at the application boundary.
4. Implement the OSM/Nominatim-backed land classifier with explicit treatment for water categories and unknown classifications, and test it separately from the planner.
5. Implement `PlanNextStopUseCase` in `@silicon-traveler/route`, including arrival, directed candidate scoring, coast approach and typed outcomes.
6. Replace each caller's duplicated orchestration with the public operation and retain persistence/status changes in its caller.
7. Export the use case through the route package entry point and update the Admin E2E route command to inspect the active itinerary/destination rather than a fixed eastbound heading.

## Test plan

- Unit-test destination bearing, candidate scoring, progress rejection, arrival/index advance, final completion, deterministic selection, coast approach, declared maritime/air transfers, attempt exhaustion, and each typed failure outcome with fake ports.
- Adapter-test OSM/Nominatim land/water classification using recorded land, coast, sea and lake responses.
- Unit-test input boundaries and malformed external responses narrowed from `unknown`.
- Add regression tests proving CLI/scheduler/Admin composition calls the shared operation and preserves the active destination state across a restart.
- Test concurrent planning/arrival attempts, provider timeout/rate-limit retry classification, and no-progress exhaustion without changing the active destination.
- Run focused route and photo Vitest suites in Docker; manually compare one controlled legacy and extracted flow before removal of duplicated code.

## Risks and decisions resolved

- “Path finding” means destination-led stop planning, not street routing. The itinerary gives the journey its editorial direction; there is no fixed east/west/north/south algorithmic heading.
- Candidate selection is deterministic after the injected random candidate projection, so tests and diagnostic runs are repeatable.
- A missing settlement is not silently converted into an `Unknown` stop; the caller receives a failure it can report or handle.
- Water avoidance is deliberately a land-continuity gate plus a coast-approach state. It prevents implausible jumps across water while keeping the geographic and operational scope bounded.

## Decisions resolved: water and long-distance transfers

- A normal `land` leg must never cross water. If water blocks it, the planner may first emit `approach_coast`, selecting a reachable coastal settlement in the direction of the active destination.
- A configured `maritime_transfer` connects two named, validated coastal settlements across a short water gap. It is rendered as a distinct/dashed map segment and is a geographic transfer, not a claim about a ferry or road route.
- A configured `air_transfer` connects named destinations across long water gaps or deliberately discontinuous itinerary regions, such as the Pacific, Atlantic, or Cape Town → Nairobi. It never invokes coastal search and is rendered distinctly from both land and maritime legs.
- Transfers are declared in the itinerary; the planner must not guess an intercontinental or ocean crossing from proximity alone.

## Remaining configuration to approve

- Arrival radius, maximum candidate attempts, coastal-search radius and maximum maritime-transfer distance.
- The editorial process for adding/changing itinerary versions after this first circuit completes.
- Whether cities, towns and villages all remain eligible or a minimum population/importance rule should reduce tiny-settlement detours.
- Retry/backoff and observability policy for geographic-provider failures, and whether a route that repeatedly cannot find a progressing settlement pauses for editorial intervention or expands a bounded search radius.
