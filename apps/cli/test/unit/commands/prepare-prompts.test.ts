import { describe, it, expect, vi, afterEach } from 'vitest';

const poolEnd = vi.fn();

vi.mock('@silicon-traveler/shared', () => ({
  pool: { end: poolEnd },
}));

class MariaDBJourneyRepository {}
vi.mock('@silicon-traveler/journey', () => ({
  MariaDBJourneyRepository,
}));

class MariaDBRouteRepository {}
class CalculateNextPointUseCase {}
class FindNearestCityUseCase {}
class GeocodePointUseCase {}
class DetectWaterUseCase {}
class OverpassAdapter {}
class NominatimAdapter {}
vi.mock('@silicon-traveler/route', () => ({
  MariaDBRouteRepository,
  CalculateNextPointUseCase,
  FindNearestCityUseCase,
  GeocodePointUseCase,
  DetectWaterUseCase,
  OverpassAdapter,
  NominatimAdapter,
}));

class BraveSearchAdapter {}
vi.mock('@silicon-traveler/research', () => ({
  BraveSearchAdapter,
}));

class OpenAIAdapter {}
vi.mock('@silicon-traveler/content', () => ({
  OpenAIAdapter,
}));

class DalleAdapter {}
class SharpAdapter {}
vi.mock('@silicon-traveler/image', () => ({
  DalleAdapter,
  SharpAdapter,
}));

class LocalStorageAdapter {}
vi.mock('@silicon-traveler/storage', () => ({
  LocalStorageAdapter,
}));

const prepareNextPhotoExecute = vi.fn().mockResolvedValue({
  routePointId: 10,
  journeyId: 1,
  sequence: 1,
  placeName: 'Test Place',
  region: 'Test Region',
  country: 'Test Country',
  coordinates: { lat: 1, lng: 1 },
  isFerryCrossing: false,
  createdNewRoutePoint: true,
  prepared: {
    imageUrl: '/images/1.jpg',
    gridThumbnailUrl: '/images/1_grid.jpg',
    heroThumbnailUrl: '/images/1_hero.jpg',
    narrative: 'Narrative',
    camera: 'Leica',
    lens: '35mm',
    iso: 100,
    shutterSpeed: '1/100',
    aperture: 'f/2.8',
    revisedPrompt: null,
  },
});

class PreparePhotoUseCase {}
class PreparePhotoPromptsUseCase {}
class PrepareNextPhotoUseCase {
  execute = prepareNextPhotoExecute;
}

vi.mock('@silicon-traveler/photo', () => ({
  PreparePhotoUseCase,
  PreparePhotoPromptsUseCase,
  PrepareNextPhotoUseCase,
}));

import { preparePrompts } from '../../../src/commands/prepare-prompts';

describe('preparePrompts', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('runs the next-photo pipeline for each day and closes the pool', async () => {
    await expect(preparePrompts({ days: 2, journeyId: 1 })).resolves.toBeUndefined();

    expect(prepareNextPhotoExecute).toHaveBeenCalledTimes(2);
    expect(prepareNextPhotoExecute).toHaveBeenCalledWith({ journeyId: 1 });
    expect(poolEnd).toHaveBeenCalledTimes(1);
  });
});
