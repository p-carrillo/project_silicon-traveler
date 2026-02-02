#!/usr/bin/env node
import { pool } from '@silicon-traveler/shared';
import { MariaDBJourneyRepository, Journey } from '@silicon-traveler/journey';
import { 
  MariaDBRouteRepository, 
  CalculateNextPointUseCase, 
  FindNearestCityUseCase,
  GeocodePointUseCase,
  DetectWaterUseCase,
  OverpassAdapter,
  NominatimAdapter
} from '@silicon-traveler/route';
import chalk from 'chalk';
import cliProgress from 'cli-progress';

const OLEIROS_LAT = 43.3328;
const OLEIROS_LNG = -8.3186;
const INITIAL_POINTS = 10;

export async function initJourney(): Promise<void> {
  console.log(chalk.bold('\n🌍 Initializing Silicon Traveler journey...\n'));

  const journeyRepo = new MariaDBJourneyRepository();
  const routeRepo = new MariaDBRouteRepository();
  const overpass = new OverpassAdapter();
  const nominatim = new NominatimAdapter();

  const calculateNextPoint = new CalculateNextPointUseCase();
  const findNearestCity = new FindNearestCityUseCase(overpass);
  const geocodePoint = new GeocodePointUseCase(nominatim);
  const detectWater = new DetectWaterUseCase(overpass);

  try {
    // 1. Create journey
    console.log(chalk.blue('→ Creating journey from Oleiros, Spain...\n'));
    
    const journeyData = Journey.create(
      'Around the World on Foot',
      { lat: OLEIROS_LAT, lng: OLEIROS_LNG },
      'east'
    );
    
    const journey = await journeyRepo.create(journeyData);

    console.log(chalk.green(`✓ Journey created (ID: ${journey.id})`));
    console.log(chalk.gray(`  Origin: ${OLEIROS_LAT}°N, ${OLEIROS_LNG}°W`));
    console.log(chalk.gray(`  Heading: East\n`));

    // 2. Generate initial route points
    console.log(chalk.blue(`→ Generating first ${INITIAL_POINTS} route points...\n`));

    const progressBar = new cliProgress.SingleBar({
      format: chalk.cyan('{bar}') + ' | {percentage}% | {value}/{total} points | {status}',
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true,
    });

    progressBar.start(INITIAL_POINTS, 0, { status: 'Starting...' });

    let currentPosition = journey.currentPosition;
    let lastSequence = await routeRepo.getLastSequence(journey.id);

    for (let i = 0; i < INITIAL_POINTS; i++) {
      progressBar.update(i, { status: `Calculating point ${i + 1}...` });

      // Calculate next point
      const nextCoordinates = calculateNextPoint.execute({
        currentPosition,
        heading: 'east',
        minDistanceKm: 15,
        maxDistanceKm: 20,
      });

      // Create route point - pass all required fields
      const routePointData = {
        journeyId: journey.id,
        sequence: lastSequence + i + 1,
        placeName: null,
        coordinates: nextCoordinates,
        country: null,
        region: null,
        isFferryCrossing: false,
        distanceFromPrevious: null,
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
      
      let routePoint = await routeRepo.create(routePointData as any);

      // Find nearest city
      progressBar.update(i, { status: `Finding city near point ${i + 1}...` });
      const city = await findNearestCity.execute(routePoint.coordinates, 10);

      if (city) {
        routePoint.placeName = city.name;
        routePoint.osmData = city.tags;
      }

      // Geocode
      progressBar.update(i, { status: `Geocoding point ${i + 1}...` });
      const location = await geocodePoint.execute(routePoint.coordinates);
      
      if (location) {
        routePoint.country = location.country;
        routePoint.region = location.region;
      }

      // Detect water (ferry crossing)
      const isWater = await detectWater.execute(currentPosition);

      if (isWater) {
        routePoint.placeName = `Ferry crossing near ${routePoint.placeName || 'unknown'}`;
      }

      // Update route point
      await routeRepo.update(routePoint);

      // Update current position for next iteration
      currentPosition = nextCoordinates;

      progressBar.increment(1, { 
        status: `✓ Point ${i + 1}: ${routePoint.placeName || 'Unknown'}, ${routePoint.country || 'Unknown'}` 
      });
    }

    progressBar.stop();

    // Update journey current position
    journey.currentPosition = currentPosition;
    await journeyRepo.update(journey);

    console.log(chalk.green.bold('\n✓ Journey initialized successfully!\n'));
    console.log(chalk.gray(`Run the Scheduler app to start generating photos.`));

  } catch (error: any) {
    console.error(chalk.red.bold('\n✗ Initialization failed:'), error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  initJourney().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
