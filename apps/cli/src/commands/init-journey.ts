#!/usr/bin/env node
import { calculateDistance, pool } from '@silicon-traveler/shared';
import { MariaDBJourneyRepository, Journey } from '@silicon-traveler/journey';
import {
  MariaDBRouteRepository,
  CalculateNextPointUseCase,
  PlanEastwardStepUseCase,
  FindAirLandingEastUseCase,
  FindNearestCityUseCase,
  GeocodePointUseCase,
  DetectWaterUseCase,
  OverpassAdapter,
  RoutingAdapter,
  NominatimAdapter,
} from '@silicon-traveler/route';
import chalk from 'chalk';
// @ts-ignore - no types available
import cliProgress from 'cli-progress';

const OLEIROS_LAT = 43.3328;
const OLEIROS_LNG = -8.3186;
const INITIAL_POINTS = 10; // Points to generate after Oleiros (sequence 1-10)

export async function initJourney(): Promise<void> {
  console.log(chalk.bold('\n🌍 Initializing Silicon Traveler journey...\n'));

  const journeyRepo = new MariaDBJourneyRepository();
  const routeRepo = new MariaDBRouteRepository();
  const overpass = new OverpassAdapter();
  const routing = new RoutingAdapter();
  const nominatim = new NominatimAdapter();

  const calculateNextPoint = new CalculateNextPointUseCase();
  const planEastwardStep = new PlanEastwardStepUseCase(routing, calculateNextPoint);
  const findNearestCity = new FindNearestCityUseCase(overpass);
  const geocodePoint = new GeocodePointUseCase(nominatim);
  const detectWater = new DetectWaterUseCase(overpass);
  const findAirLandingEast = new FindAirLandingEastUseCase(detectWater, findNearestCity, geocodePoint);

  try {
    // 1. Create journey
    console.log(chalk.blue('→ Creating journey from Oleiros, Spain...\n'));

    const journeyData = Journey.create('Around the World on Foot', { lat: OLEIROS_LAT, lng: OLEIROS_LNG }, 'east');

    const journey = await journeyRepo.create(journeyData);

    console.log(chalk.green(`✓ Journey created (ID: ${journey.id})`));
    console.log(chalk.gray(`  Origin: ${OLEIROS_LAT}°N, ${OLEIROS_LNG}°W`));
    console.log(chalk.gray(`  Heading: East\n`));

    // 2. Create Point 0 at Oleiros (starting point)
    console.log(chalk.blue('→ Creating starting point at Oleiros...\n'));

    const startingPointData = {
      journeyId: journey.id,
      sequence: 0,
      placeName: 'Oleiros',
      coordinates: { lat: OLEIROS_LAT, lng: OLEIROS_LNG },
      country: 'Spain',
      region: 'Galicia',
      isFferryCrossing: false,
      travelMode: 'land' as const,
      distanceFromPrevious: null, // First point has no previous
      osmData: null,
      researchSummary: null,
      imagePrompt: null,
      narrativePrompt: null,
      cameraMetadata: null,
      status: 'pending' as const,
      errorMessage: null,
      imagePath: null,
      thumbnailPath: null,
      publishedAt: null,
    };

    await routeRepo.create(startingPointData);
    console.log(chalk.green('✓ Starting point created (Sequence 0: Oleiros, Spain)\n'));

    // 3. Generate next route points
    console.log(chalk.blue(`→ Generating next ${INITIAL_POINTS} route points...\n`));

    const progressBar = new cliProgress.SingleBar({
      format: chalk.cyan('{bar}') + ' | {percentage}% | {value}/{total} points | {status}',
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true,
    });

    progressBar.start(INITIAL_POINTS, 0, { status: 'Starting...' });

    let currentPosition = journey.currentPosition;
    const lastSequence = await routeRepo.getLastSequence(journey.id);

    for (let i = 0; i < INITIAL_POINTS; i += 1) {
      progressBar.update(i, { status: `Planning point ${i + 1}...` });

      const landStep = await planEastwardStep.execute({
        currentPosition,
        heading: 'east',
        minDistanceKm: 20,
        maxDistanceKm: 30,
      });

      const airStep = !landStep
        ? await findAirLandingEast.execute({
            currentPosition,
          })
        : null;

      const fallbackCoordinates = calculateNextPoint.execute({
        currentPosition,
        heading: 'east',
        minDistanceKm: 20,
        maxDistanceKm: 30,
      });

      const nextCoordinates = landStep?.coordinates ?? airStep?.coordinates ?? fallbackCoordinates;
      const travelMode = landStep?.travelMode ?? airStep?.travelMode ?? 'land';
      const distanceFromPrevious =
        landStep?.distanceFromPrevious ??
        airStep?.distanceFromPrevious ??
        calculateDistance(currentPosition, fallbackCoordinates);

      // Create route point - pass all required fields
      const routePointData = {
        journeyId: journey.id,
        sequence: lastSequence + i + 1,
        placeName: airStep?.placeName ?? null,
        coordinates: nextCoordinates,
        country: airStep?.country ?? null,
        region: airStep?.region ?? null,
        isFferryCrossing: false,
        travelMode,
        distanceFromPrevious,
        osmData: airStep?.osmData ?? null,
        researchSummary: null,
        imagePrompt: null,
        narrativePrompt: null,
        cameraMetadata: null,
        status: 'pending' as const,
        errorMessage: null,
        imagePath: null,
        thumbnailPath: null,
        publishedAt: null,
      };

      const routePoint = await routeRepo.create(routePointData);

      if (travelMode === 'land') {
        // Find nearest city
        progressBar.update(i, { status: `Finding city near point ${i + 1}...` });
        const city = await findNearestCity.execute(routePoint.coordinates, 10);

        if (city) {
          routePoint.placeName = city.name;
          routePoint.osmData = city.tags;
        }
      }

      // Geocode
      progressBar.update(i, { status: `Geocoding point ${i + 1}...` });
      const location = await geocodePoint.execute(routePoint.coordinates);

      if (location) {
        routePoint.country = routePoint.country || location.country;
        routePoint.region = routePoint.region || location.region;
        if (!routePoint.placeName && location.placeName && location.placeName !== 'Unknown') {
          routePoint.placeName = location.placeName;
        }
      }

      // Update route point
      await routeRepo.update(routePoint);

      // Update current position for next iteration
      currentPosition = nextCoordinates;

      progressBar.increment(1, {
        status: `✓ Point ${i + 1}: ${routePoint.placeName || 'Unknown'}, ${routePoint.country || 'Unknown'} (${travelMode})`,
      });
    }

    progressBar.stop();

    // Update journey current position
    journey.updatePosition(currentPosition);
    await journeyRepo.update(journey);

    console.log(chalk.green.bold('\n✓ Journey initialized successfully!\n'));
    console.log(chalk.gray('Run the Scheduler app to start generating photos.'));
  } catch (error: any) {
    console.error(chalk.red.bold('\n✗ Initialization failed:'), error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  initJourney().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
