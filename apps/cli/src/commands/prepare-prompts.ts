import { pool } from '@silicon-traveler/shared';
import { MariaDBJourneyRepository } from '@silicon-traveler/journey';
import {
  MariaDBRouteRepository,
  CalculateNextPointUseCase,
  FindNearestCityUseCase,
  GeocodePlaceUseCase,
  GeocodePointUseCase,
  OverpassAdapter,
  NominatimAdapter,
} from '@silicon-traveler/route';
import { BraveSearchAdapter } from '@silicon-traveler/research';
import { OpenAIAdapter } from '@silicon-traveler/content';
import { DalleAdapter, SharpAdapter } from '@silicon-traveler/image';
import { LocalStorageAdapter } from '@silicon-traveler/storage';
import { PrepareNextPhotoUseCase, PreparePhotoPromptsUseCase, PreparePhotoUseCase } from '@silicon-traveler/photo';
import type { PrepareNextPhotoResult, PrepareNextPhotoMode } from '@silicon-traveler/photo';

export interface PreparePromptsOptions {
  days: number;
  journeyId: number;
  promptsOnly?: boolean;
}

export async function preparePrompts(options: PreparePromptsOptions): Promise<void> {
  const days = Number(options.days);
  if (!Number.isFinite(days) || days <= 0) {
    throw new Error('Days must be a positive number');
  }

  const journeyId = Number(options.journeyId);
  if (!Number.isFinite(journeyId) || journeyId <= 0) {
    throw new Error('Journey ID must be a positive number');
  }

  const journeyRepo = new MariaDBJourneyRepository();
  const routeRepo = new MariaDBRouteRepository();
  const overpass = new OverpassAdapter();
  const nominatim = new NominatimAdapter();

  const calculateNextPoint = new CalculateNextPointUseCase();
  const findNearestCity = new FindNearestCityUseCase(overpass);
  const geocodePlace = new GeocodePlaceUseCase(nominatim);
  const geocodePoint = new GeocodePointUseCase(nominatim);

  const braveSearch = new BraveSearchAdapter();
  const llm = new OpenAIAdapter();
  const dalle = new DalleAdapter();
  const sharp = new SharpAdapter();
  const storage = new LocalStorageAdapter();

  const preparePhotoUseCase = new PreparePhotoUseCase(routeRepo, braveSearch, llm, dalle, sharp, storage);
  const preparePhotoPromptsUseCase = new PreparePhotoPromptsUseCase(routeRepo, braveSearch, llm);
  const mode: PrepareNextPhotoMode = options.promptsOnly ? 'prompts-only' : 'full';
  const prepareNextPhotoUseCase = new PrepareNextPhotoUseCase(
    journeyRepo,
    routeRepo,
    calculateNextPoint,
    findNearestCity,
    geocodePlace,
    geocodePoint,
    preparePhotoUseCase,
    preparePhotoPromptsUseCase,
    { mode }
  );

  try {
    const results: PrepareNextPhotoResult[] = [];

    for (let i = 0; i < days; i += 1) {
      const prepared = await prepareNextPhotoUseCase.execute({ journeyId });
      results.push(prepared);
    }

    const placeNames = results.map((result) => result.placeName || 'Unknown');
    const lastPlaceName = placeNames.length > 0 ? placeNames[placeNames.length - 1] : null;

    // Get the previous route point (last published location)
    const allPublished = await routeRepo.findByStatus('published');
    const lastPublished = allPublished.length > 0 ? allPublished[allPublished.length - 1] : null;

    const previousLocation = lastPublished
      ? {
          routePointId: lastPublished.id,
          sequence: lastPublished.sequence,
          placeName: lastPublished.placeName,
          region: lastPublished.region,
          country: lastPublished.country,
          coordinates: lastPublished.coordinates,
        }
      : null;

    // Serialize results to JSON-safe format
    const serializedResults = results.map((result) => {
      // Extract only serializable fields from prepared object
      const preparedData: any = {};
      if ('imageUrl' in result.prepared) {
        // It's PreparePhotoResult
        preparedData.imageUrl = result.prepared.imageUrl;
        preparedData.gridThumbnailUrl = result.prepared.gridThumbnailUrl;
        preparedData.heroThumbnailUrl = result.prepared.heroThumbnailUrl;
        preparedData.narrative = result.prepared.narrative;
        preparedData.imagePrompt = result.prepared.imagePrompt;
        preparedData.camera = result.prepared.camera;
        preparedData.lens = result.prepared.lens;
        preparedData.iso = result.prepared.iso;
        preparedData.shutterSpeed = result.prepared.shutterSpeed;
        preparedData.aperture = result.prepared.aperture;
        preparedData.revisedPrompt = result.prepared.revisedPrompt;
      } else {
        // It's PreparePhotoPromptsResult
        preparedData.routePointId = result.prepared.routePointId;
        preparedData.contentStatus = result.prepared.contentStatus;
        preparedData.researchQuery = result.prepared.researchQuery;
        preparedData.researchSummary = result.prepared.researchSummary;
        preparedData.imagePrompt = result.prepared.imagePrompt;
        preparedData.narrative = result.prepared.narrative;
        preparedData.cameraMetadata = result.prepared.cameraMetadata;
      }

      return {
        routePointId: result.routePointId,
        journeyId: result.journeyId,
        sequence: result.sequence,
        placeName: result.placeName,
        region: result.region,
        country: result.country,
        coordinates: result.coordinates,
        createdNewRoutePoint: result.createdNewRoutePoint,
        mode: result.mode,
        prepared: preparedData,
      };
    });

    const output = {
      journeyId,
      days,
      generatedAt: new Date().toISOString(),
      previousLocation,
      placeNames,
      lastPlaceName,
      results: serializedResults,
    };

    try {
      const replacer = (_key: string, value: unknown): unknown =>
        typeof value === 'bigint' ? Number(value) : value;
      console.log(JSON.stringify(output, replacer, 2));
    } catch (serializeError) {
      throw new Error(`Failed to serialize output: ${serializeError instanceof Error ? serializeError.message : String(serializeError)}`);
    }
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  preparePrompts({ days: Number(process.argv[2]), journeyId: Number(process.argv[3] || 1) }).catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
