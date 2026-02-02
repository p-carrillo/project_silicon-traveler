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
import { PreparePhotoUseCase } from '@silicon-traveler/photo';

const BUFFER_SIZE = 10;
const BUFFER_THRESHOLD = 3; // Alert if buffer drops below this

export class GeneratorJob {
  private isRunning = false;

  constructor(
    private readonly journeyRepo: MariaDBJourneyRepository,
    private readonly routeRepo: MariaDBRouteRepository,
    private readonly preparePhotoUseCase: PreparePhotoUseCase
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
          // Get next pending route point
          const pendingPoints = await this.routeRepo.findByStatus('pending', 1);

          if (pendingPoints.length === 0) {
            // No pending points, need to calculate new route point
            console.log('[Generator] No pending points, calculating new route...');
            
            const calculateNextPoint = new CalculateNextPointUseCase();
            const findNearestCity = new FindNearestCityUseCase(new OverpassAdapter());
            const geocodePoint = new GeocodePointUseCase(new NominatimAdapter());
            const detectWater = new DetectWaterUseCase(new OverpassAdapter());

            const lastSequence = await this.routeRepo.getLastSequence(journey.id);
            const nextCoordinates = calculateNextPoint.execute({
              currentPosition: journey.currentPosition,
              heading: 'east',
              minDistanceKm: 15,
              maxDistanceKm: 20,
            });

            let routePoint = await this.routeRepo.create({
              journeyId: journey.id,
              sequence: lastSequence + 1,
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
              status: 'pending',
              errorMessage: null,
              imagePath: null,
              thumbnailPath: null,
              publishedAt: null,
            } as any);

            // Enrich with city and geocoding
            const city = await findNearestCity.execute(routePoint.coordinates, 10);
            if (city) {
              routePoint.placeName = city.name;
              routePoint.osmData = city.tags;
            }

            const location = await geocodePoint.execute(routePoint.coordinates);
            if (location) {
              routePoint.country = location.country;
              routePoint.region = location.region;
            }

            const isWater = await detectWater.execute(journey.currentPosition);
            if (isWater) {
              routePoint.placeName = `Ferry crossing near ${routePoint.placeName || 'unknown'}`;
            }

            await this.routeRepo.update(routePoint);

            // Update journey position
            journey.updatePosition(nextCoordinates);
            await this.journeyRepo.update(journey);

            console.log(`[Generator] Created route point ${routePoint.id}: ${routePoint.placeName || 'Unknown'}`);

            // Now prepare this photo
            await this.preparePhoto(routePoint.id);
          } else {
            // Prepare existing pending point
            const routePoint = pendingPoints[0];
            console.log(`[Generator] Processing pending point ${routePoint.id}: ${routePoint.placeName || 'Unknown'}`);
            await this.preparePhoto(routePoint.id);
          }

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

  private async preparePhoto(routePointId: number): Promise<void> {
    console.log(`[Generator]   Preparing photo for route point ${routePointId}...`);
    
    try {
      const result = await this.preparePhotoUseCase.execute(routePointId);
      console.log(`[Generator]   ✓ Photo ready: ${result.imageUrl}`);
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

  const preparePhotoUseCase = new PreparePhotoUseCase(
    routeRepo,
    braveSearch,
    llm,
    dalle,
    sharp,
    storage
  );

  return new GeneratorJob(journeyRepo, routeRepo, preparePhotoUseCase);
}
