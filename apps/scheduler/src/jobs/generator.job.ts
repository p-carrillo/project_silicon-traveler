import { MariaDBJourneyRepository } from '@silicon-traveler/journey';
import {
  MariaDBRouteRepository,
  CalculateNextPointUseCase,
  FindNearestCityUseCase,
  GeocodePointUseCase,
  DetectWaterUseCase,
  OverpassAdapter,
  NominatimAdapter,
} from '@silicon-traveler/route';
import { BraveSearchAdapter } from '@silicon-traveler/research';
import { OpenAIAdapter as ContentOpenAI } from '@silicon-traveler/content';
import { DalleAdapter, SharpAdapter } from '@silicon-traveler/image';
import { LocalStorageAdapter } from '@silicon-traveler/storage';
import { PrepareNextPhotoUseCase, PreparePhotoPromptsUseCase, PreparePhotoUseCase } from '@silicon-traveler/photo';

const BUFFER_SIZE = 10;
const BUFFER_THRESHOLD = 3; // Alert if buffer drops below this

export class GeneratorJob {
  private isRunning = false;

  constructor(
    private readonly journeyRepo: MariaDBJourneyRepository,
    private readonly routeRepo: MariaDBRouteRepository,
    private readonly prepareNextPhotoUseCase: PrepareNextPhotoUseCase
  ) {}

  async execute(): Promise<void> {
    if (this.isRunning) {
      console.log('[Generator] Already running, skipping...');
      return;
    }

    this.isRunning = true;
    console.log(`[Generator] Starting at ${new Date().toISOString()}`);

    try {
      // Check buffer size
      const bufferCount = await this.routeRepo.countByStatuses(['image_ready', 'content_generated']);
      console.log(`[Generator] Current buffer: ${bufferCount}/${BUFFER_SIZE}`);

      if (bufferCount < BUFFER_THRESHOLD) {
        console.warn(`[Generator] ⚠️  Buffer low (${bufferCount}/${BUFFER_SIZE})!`);
      }

      if (bufferCount >= BUFFER_SIZE) {
        console.log('[Generator] Buffer full, nothing to do');
        return;
      }

      // Get journey (assume ID 1 for now)
      const journey = await this.journeyRepo.findById(1);
      if (!journey) {
        console.error('[Generator] No journey found with ID 1');
        return;
      }
      console.log(`[Generator] Processing journey ${journey.id}`);

      // Generate photos until buffer full
      const needed = BUFFER_SIZE - bufferCount;
      console.log(`[Generator] Need to generate ${needed} photo(s)`);

      for (let i = 0; i < needed; i++) {
        try {
          await this.prepareNextPhoto(journey.id);
        } catch (error: any) {
          console.error(`[Generator] Error preparing photo ${i + 1}:`, error.message);
          // Continue with next photo
        }
      }

      console.log('[Generator] ✓ Completed successfully');

    } catch (error: any) {
      console.error('[Generator] Fatal error:', error.message);
    } finally {
      this.isRunning = false;
    }
  }

  private async prepareNextPhoto(journeyId: number): Promise<void> {
    console.log(`[Generator]   Preparing photo for journey ${journeyId}...`);

    try {
      const result = await this.prepareNextPhotoUseCase.execute({ journeyId });
      const placeName = result.placeName || 'Unknown';

      if (result.createdNewRoutePoint) {
        console.log(`[Generator]   Created route point ${result.routePointId}: ${placeName}`);
      } else {
        console.log(`[Generator]   Using pending route point ${result.routePointId}: ${placeName}`);
      }

      if ('imageUrl' in result.prepared) {
        console.log(`[Generator]   ✓ Photo ready: ${result.prepared.imageUrl}`);
      } else {
        console.log(`[Generator]   ✓ Prompts ready for route point ${result.routePointId}`);
      }
    } catch (error: any) {
      console.error(`[Generator]   ✗ Failed to prepare photo:`, error.message);
      throw error;
    }
  }
}

export function createGeneratorJob(): GeneratorJob {
  const journeyRepo = new MariaDBJourneyRepository();
  const routeRepo = new MariaDBRouteRepository();

  const braveSearch = new BraveSearchAdapter();
  const llm = new ContentOpenAI();
  const dalle = new DalleAdapter();
  const sharp = new SharpAdapter();
  const storage = new LocalStorageAdapter();

  const calculateNextPoint = new CalculateNextPointUseCase();
  const overpass = new OverpassAdapter();
  const nominatim = new NominatimAdapter();
  const findNearestCity = new FindNearestCityUseCase(overpass);
  const geocodePoint = new GeocodePointUseCase(nominatim);
  const detectWater = new DetectWaterUseCase(overpass);

  const preparePhotoUseCase = new PreparePhotoUseCase(
    routeRepo,
    braveSearch,
    llm,
    dalle,
    sharp,
    storage
  );

  const preparePhotoPromptsUseCase = new PreparePhotoPromptsUseCase(routeRepo, braveSearch, llm);

  const prepareNextPhotoUseCase = new PrepareNextPhotoUseCase(
    journeyRepo,
    routeRepo,
    calculateNextPoint,
    findNearestCity,
    geocodePoint,
    detectWater,
    preparePhotoUseCase,
    preparePhotoPromptsUseCase
  );

  return new GeneratorJob(journeyRepo, routeRepo, prepareNextPhotoUseCase);
}
