import fs from 'fs/promises';
import path from 'path';
import { calculateDistance, pool, type Point } from '@silicon-traveler/shared';
import { Journey, MariaDBJourneyRepository } from '@silicon-traveler/journey';
import {
  CalculateNextPointUseCase,
  FindNearestCityUseCase,
  GeocodePlaceUseCase,
  GeocodePointUseCase,
  MariaDBRouteRepository,
  NominatimAdapter,
  OverpassAdapter,
  type RoutePointCreateParams,
} from '@silicon-traveler/route';
import { MariaDBPhotoRepository, PublishPhotoUseCase } from '@silicon-traveler/photo';
import { LocalStorageAdapter } from '@silicon-traveler/storage';

type Heading = 'east' | 'west' | 'north' | 'south';

const SUPPORTED_IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const DEFAULT_SEED_IMAGES_DIR = '.ai/pictures_seed';
const DEFAULT_MIN_DISTANCE_KM = 20;
const DEFAULT_MAX_DISTANCE_KM = 30;
const DEFAULT_CITY_RADIUS_KM = 10;
const OLEIROS_LAT = 43.3328;
const OLEIROS_LNG = -8.3186;

const LOREM_SNIPPETS = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
  'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
];

const CAMERA_PRESETS = [
  { camera: 'Leica M11', lens: '35mm f/1.4', iso: 400, shutterSpeed: '1/250', aperture: 'f/2.8' },
  { camera: 'Nikon F3', lens: '50mm f/1.8', iso: 200, shutterSpeed: '1/125', aperture: 'f/4' },
  { camera: 'Pentax K1000', lens: '28mm f/2.8', iso: 400, shutterSpeed: '1/500', aperture: 'f/5.6' },
  { camera: 'Canon AE-1', lens: '85mm f/1.8', iso: 800, shutterSpeed: '1/250', aperture: 'f/2' },
];

export interface PublishSeedPointOptions {
  journeyId: number;
  seedDir?: string;
  seedIndex?: number;
  mapRefresh?: boolean;
}

export interface PublishSeedPointResult {
  journeyId: number;
  routePointId: number;
  sequence: number;
  photoId: number;
  placeName: string | null;
  country: string | null;
  region: string | null;
  coordinates: Point;
  seedImagePath: string;
  imagePath: string;
  thumbnailPath: string;
}

export async function publishSeedPoint(options: PublishSeedPointOptions): Promise<PublishSeedPointResult> {
  const journeyId = Number(options.journeyId);
  if (!Number.isFinite(journeyId) || journeyId <= 0) {
    throw new Error('Journey ID must be a positive number');
  }

  if (options.seedIndex !== undefined) {
    const seedIndex = Number(options.seedIndex);
    if (!Number.isFinite(seedIndex) || seedIndex <= 0) {
      throw new Error('Seed index must be a positive number');
    }
  }

  const journeyRepo = new MariaDBJourneyRepository();
  const routeRepo = new MariaDBRouteRepository();
  const photoRepo = new MariaDBPhotoRepository(pool);
  const storage = new LocalStorageAdapter();

  const calculateNextPoint = new CalculateNextPointUseCase();
  const overpass = new OverpassAdapter();
  const nominatim = new NominatimAdapter();
  const findNearestCity = new FindNearestCityUseCase(overpass);
  const geocodePlace = new GeocodePlaceUseCase(nominatim);
  const geocodePoint = new GeocodePointUseCase(nominatim);
  const publishPhotoUseCase = new PublishPhotoUseCase(photoRepo, routeRepo);

  try {
    const journey = await resolveJourneyForPublish(journeyId, journeyRepo, routeRepo);

    const heading = resolveHeading(journey.heading);
    const nextCoordinates = calculateNextPoint.execute({
      currentPosition: journey.currentPosition,
      heading,
      minDistanceKm: DEFAULT_MIN_DISTANCE_KM,
      maxDistanceKm: DEFAULT_MAX_DISTANCE_KM,
    });

    const distanceFromPrevious = calculateDistance(journey.currentPosition, nextCoordinates);

    const lastSequence = await routeRepo.getLastSequence(journey.id);
    const routePointParams: RoutePointCreateParams = {
      journeyId: journey.id,
      sequence: lastSequence + 1,
      placeName: null,
      coordinates: nextCoordinates,
      country: null,
      region: null,
      distanceFromPrevious,
      osmData: null,
      researchSummary: null,
      imagePrompt: null,
      narrativePrompt: null,
      cameraMetadata: null,
      status: 'pending',
      errorMessage: null,
      imagePath: null,
      thumbnailPath: null,
      publishedAt: null,
    };

    const routePoint = await routeRepo.create(routePointParams);

    const nearestCity = await safeExecute(
      () => findNearestCity.execute(routePoint.coordinates, DEFAULT_CITY_RADIUS_KM),
      null,
      'city lookup'
    );
    if (nearestCity) {
      routePoint.placeName = nearestCity.name;
      routePoint.osmData = nearestCity.tags;
      routePoint.coordinates = { lat: nearestCity.lat, lng: nearestCity.lon };
    }

    const location = await safeExecute(() => geocodePoint.execute(routePoint.coordinates), null, 'geocoding');
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

    if (!isKnownPlace(routePoint.placeName)) {
      routePoint.placeName = `Waypoint ${routePoint.sequence}`;
    }

    routePoint.updateResearch('Seeded route point: local image and lorem ipsum narrative.', routePoint.osmData);
    await routeRepo.update(routePoint);

    const cameraMetadata = cameraPresetForSequence(routePoint.sequence);
    const imagePrompt = seedImagePrompt(routePoint.placeName, routePoint.region, routePoint.country);
    const narrative = loremNarrative(routePoint.placeName, routePoint.country, routePoint.sequence);
    routePoint.updateContent(imagePrompt, narrative, cameraMetadata);
    await routeRepo.update(routePoint);

    const seedImagePath = await resolveSeedImagePath({
      seedDir: options.seedDir,
      seedIndex: options.seedIndex,
      sequence: routePoint.sequence,
    });
    const sourceImage = await fs.readFile(seedImagePath);

    const extension = path.extname(seedImagePath).toLowerCase() || '.jpg';
    const storageDate = await resolveStorageDate(routeRepo, routePoint.journeyId, routePoint.sequence);
    const filename = `${routePoint.id}${extension}`;

    const savedImage = await storage.saveImage(sourceImage, filename, storageDate);
    const savedGridThumbnail = await storage.saveThumbnail(sourceImage, filename, '_grid', storageDate);
    const savedHeroThumbnail = await storage.saveThumbnail(sourceImage, filename, '_hero', storageDate);

    routePoint.updateImages(savedImage.url, savedGridThumbnail.url);
    await routeRepo.update(routePoint);

    journey.updatePosition(routePoint.coordinates);
    await journeyRepo.update(journey);

    const photoId = await publishPhotoUseCase.execute(routePoint.id, {
      imageUrl: savedImage.url,
      gridThumbnailUrl: savedGridThumbnail.url,
      heroThumbnailUrl: savedHeroThumbnail.url,
      narrative,
      imagePrompt,
      camera: cameraMetadata.camera,
      lens: cameraMetadata.lens,
      iso: cameraMetadata.iso,
      shutterSpeed: cameraMetadata.shutterSpeed,
      aperture: cameraMetadata.aperture,
      revisedPrompt: null,
    });

    if (options.mapRefresh !== false) {
      await notifyMapRefresh(photoId);
    }

    return {
      journeyId: toSafeNumber(journey.id),
      routePointId: toSafeNumber(routePoint.id),
      sequence: toSafeNumber(routePoint.sequence),
      photoId: toSafeNumber(photoId),
      placeName: routePoint.placeName,
      country: routePoint.country,
      region: routePoint.region,
      coordinates: routePoint.coordinates,
      seedImagePath,
      imagePath: savedImage.url,
      thumbnailPath: savedGridThumbnail.url,
    };
  } finally {
    await pool.end();
  }
}

async function resolveJourneyForPublish(
  journeyId: number,
  journeyRepo: MariaDBJourneyRepository,
  routeRepo: MariaDBRouteRepository
): Promise<Journey> {
  const existing = await journeyRepo.findById(journeyId);
  if (existing) {
    return existing;
  }

  const active = await journeyRepo.findActive();
  if (active) {
    throw new Error(`Journey ${journeyId} not found (active journey: ${active.id})`);
  }

  const createdJourney = await journeyRepo.create(
    Journey.create('Around the World on Foot', { lat: OLEIROS_LAT, lng: OLEIROS_LNG }, 'east')
  );

  const startingPoint: RoutePointCreateParams = {
    journeyId: createdJourney.id,
    sequence: 0,
    placeName: 'Oleiros',
    coordinates: { lat: OLEIROS_LAT, lng: OLEIROS_LNG },
    country: 'Spain',
    region: 'Galicia',
    distanceFromPrevious: null,
    osmData: null,
    researchSummary: null,
    imagePrompt: null,
    narrativePrompt: null,
    cameraMetadata: null,
    status: 'pending',
    errorMessage: null,
    imagePath: null,
    thumbnailPath: null,
    publishedAt: null,
  };
  await routeRepo.create(startingPoint);

  const createdJourneyId = toSafeNumber(createdJourney.id);
  if (createdJourneyId !== journeyId) {
    console.warn(
      `[publish-seed-point] Requested journey ${journeyId} did not exist. Created journey ${createdJourneyId} from Oleiros.`
    );
  } else {
    console.warn(`[publish-seed-point] Journey ${journeyId} did not exist. Created from Oleiros.`);
  }

  return createdJourney;
}

async function notifyMapRefresh(photoId: number): Promise<void> {
  const apiUrl = process.env.API_URL || 'http://api:3000';
  const apiKey = process.env.API_KEY;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const headers = new Headers({ 'Content-Type': 'application/json' });
    if (apiKey) {
      headers.set('Authorization', `Bearer ${apiKey}`);
    }

    const response = await fetch(`${apiUrl}/api/map/refresh`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ photo_id: photoId }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.text();
      console.warn(`[publish-seed-point] Map refresh failed (${response.status}): ${body}`);
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[publish-seed-point] Map refresh failed: ${message}`);
  } finally {
    clearTimeout(timeout);
  }
}

async function resolveStorageDate(
  routeRepo: MariaDBRouteRepository,
  journeyId: number,
  sequence: number
): Promise<Date> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const firstScheduled = await routeRepo.findFirstScheduledByJourney(journeyId);
  if (!firstScheduled) {
    return today;
  }

  const offsetDays = Math.max(sequence - firstScheduled.sequence, 0);
  const scheduledDate = new Date(today);
  scheduledDate.setDate(scheduledDate.getDate() + offsetDays);
  return scheduledDate;
}

async function resolveSeedImagePath(params: {
  seedDir?: string;
  seedIndex?: number;
  sequence: number;
}): Promise<string> {
  const sourceDir = params.seedDir || process.env.SEED_PHOTOS_SOURCE_DIR || DEFAULT_SEED_IMAGES_DIR;
  const absoluteSourceDir = path.isAbsolute(sourceDir)
    ? sourceDir
    : path.resolve(resolveProjectRoot(), sourceDir);

  const entries = await fs.readdir(absoluteSourceDir, { withFileTypes: true });
  const imagePaths = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => SUPPORTED_IMAGE_EXTENSIONS.has(path.extname(name).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
    .map((name) => path.join(absoluteSourceDir, name));

  if (imagePaths.length === 0) {
    throw new Error(`No seed images found in ${absoluteSourceDir}`);
  }

  if (params.seedIndex !== undefined) {
    const targetIndex = params.seedIndex - 1;
    if (targetIndex < 0 || targetIndex >= imagePaths.length) {
      throw new Error(`Seed index out of range (1-${imagePaths.length})`);
    }
    return imagePaths[targetIndex];
  }

  const sequenceIndex = (params.sequence - 1) % imagePaths.length;
  return imagePaths[sequenceIndex];
}

function resolveProjectRoot(): string {
  return path.resolve(__dirname, '../../../..');
}

function toSafeNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'bigint') {
    return Number(value);
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return 0;
}

function resolveHeading(value: string | null | undefined): Heading {
  const allowed: Heading[] = ['east', 'west', 'north', 'south'];
  if (value && allowed.includes(value as Heading)) {
    return value as Heading;
  }
  return 'east';
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

async function resolveCoordinatesFromPlace(params: {
  routePoint: {
    placeName: string | null;
    region: string | null;
    country: string | null;
  };
  geocodePlace: GeocodePlaceUseCase;
}): Promise<Point | null> {
  const query = buildPlaceQuery(params.routePoint);
  if (!query) {
    return null;
  }

  const geocoded = await safeExecute(
    () => params.geocodePlace.execute(query),
    null,
    'place geocoding'
  );
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

function loremNarrative(placeName: string | null, country: string | null, sequence: number): string {
  const intro = `Route point ${sequence}: ${placeName || 'Unknown place'}${country ? `, ${country}` : ''}.`;
  const snippetA = LOREM_SNIPPETS[sequence % LOREM_SNIPPETS.length];
  const snippetB = LOREM_SNIPPETS[(sequence + 1) % LOREM_SNIPPETS.length];
  return `${intro} ${snippetA} ${snippetB}`;
}

function seedImagePrompt(placeName: string | null, region: string | null, country: string | null): string {
  const place = placeName || 'Unknown place';
  const location = [region, country].filter(Boolean).join(', ');
  if (location) {
    return `Documentary black and white photo in ${place}, ${location}.`;
  }
  return `Documentary black and white photo in ${place}.`;
}

function cameraPresetForSequence(sequence: number): {
  camera: string;
  lens: string;
  iso: number;
  shutterSpeed: string;
  aperture: string;
} {
  return CAMERA_PRESETS[(sequence - 1) % CAMERA_PRESETS.length];
}

async function safeExecute<T>(
  fn: () => Promise<T>,
  fallback: T,
  label: string
): Promise<T> {
  try {
    return await fn();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[publish-seed-point] ${label} failed: ${message}`);
    return fallback;
  }
}
