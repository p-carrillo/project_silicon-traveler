#!/usr/bin/env node
import { pool } from '@silicon-traveler/shared';
import { MariaDBJourneyRepository, Journey } from '@silicon-traveler/journey';
import { 
  MariaDBRouteRepository, 
  CalculateNextPointUseCase, 
  FindNearestCityUseCase,
  GeocodePlaceUseCase,
  GeocodePointUseCase,
  OverpassAdapter,
  NominatimAdapter
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
  const nominatim = new NominatimAdapter();

  const calculateNextPoint = new CalculateNextPointUseCase();
  const findNearestCity = new FindNearestCityUseCase(overpass);
  const geocodePlace = new GeocodePlaceUseCase(nominatim);
  const geocodePoint = new GeocodePointUseCase(nominatim);

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

    // 2. Create Point 0 at Oleiros (starting point)
    console.log(chalk.blue('→ Creating starting point at Oleiros...\n'));
    
    const startingPointData = {
      journeyId: journey.id,
      sequence: 0,
      placeName: 'Oleiros',
      coordinates: { lat: OLEIROS_LAT, lng: OLEIROS_LNG },
      country: 'Spain',
      region: 'Galicia',
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

    await routeRepo.create(startingPointData as any);
    console.log(chalk.green(`✓ Starting point created (Sequence 0: Oleiros, Spain)\n`));

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
    let lastSequence = await routeRepo.getLastSequence(journey.id);

    for (let i = 0; i < INITIAL_POINTS; i++) {
      progressBar.update(i, { status: `Calculating point ${i + 1}...` });

      // Calculate next point
      const nextCoordinates = calculateNextPoint.execute({
        currentPosition,
        heading: 'east',
        minDistanceKm: 20,
        maxDistanceKm: 30,
      });

      // Create route point - pass all required fields
      const routePointData = {
        journeyId: journey.id,
        sequence: lastSequence + i + 1,
        placeName: null,
        coordinates: nextCoordinates,
        country: null,
        region: null,
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
        routePoint.coordinates = { lat: city.lat, lng: city.lon };
      }

      // Geocode
      progressBar.update(i, { status: `Geocoding point ${i + 1}...` });
      const location = await geocodePoint.execute(routePoint.coordinates);
      
      if (location) {
        routePoint.country = location.country;
        routePoint.region = location.region;
        if (!routePoint.placeName && location.placeName && location.placeName !== 'Unknown') {
          routePoint.placeName = location.placeName;
        }
      }

      const snappedCoordinates = await resolveCoordinatesFromPlace({
        routePoint,
        geocodePlace,
      });
      if (snappedCoordinates) {
        routePoint.coordinates = snappedCoordinates;
      }

      // Update route point
      await routeRepo.update(routePoint);

      // Update current position for next iteration
      currentPosition = routePoint.coordinates;

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

function isKnownPlace(placeName: string | null | undefined): boolean {
  if (!placeName) return false;
  const normalized = placeName.trim().toLowerCase();
  if (!normalized) return false;
  if (normalized === 'unknown' || normalized === 'unknown place' || normalized === 'unknown location') {
    return false;
  }
  if (normalized.startsWith('unknown') || normalized.endsWith('unknown')) {
    return false;
  }
  return true;
}

function buildPlaceQuery(routePoint: {
  placeName: string | null;
  region: string | null;
  country: string | null;
}): string | null {
  if (!isKnownPlace(routePoint.placeName)) {
    return null;
  }

  const placeName = routePoint.placeName!.trim();
  const region = routePoint.region?.trim();
  const country = routePoint.country?.trim();

  return [placeName, region, country].filter(Boolean).join(', ');
}

async function resolveCoordinatesFromPlace(params: {
  routePoint: {
    placeName: string | null;
    region: string | null;
    country: string | null;
  };
  geocodePlace: GeocodePlaceUseCase;
}): Promise<{ lat: number; lng: number } | null> {
  const query = buildPlaceQuery(params.routePoint);
  if (!query) {
    return null;
  }

  try {
    const geocoded = await params.geocodePlace.execute(query);
    if (!geocoded) {
      return null;
    }

    if (isKnownPlace(geocoded.placeName)) {
      params.routePoint.placeName = geocoded.placeName;
    }
    if (geocoded.country) {
      params.routePoint.country = geocoded.country;
    }
    if (geocoded.region) {
      params.routePoint.region = geocoded.region;
    }

    return geocoded.coordinates;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[init-journey] place geocoding failed: ${message}`);
    return null;
  }
}
