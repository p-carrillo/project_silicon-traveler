import { describe, it, expect, vi, afterEach } from 'vitest';

vi.mock('@silicon-traveler/shared', () => ({
  pool: { end: vi.fn() },
}));

vi.mock('@silicon-traveler/journey', () => ({
  MariaDBJourneyRepository: vi.fn(),
}));

vi.mock('@silicon-traveler/route', () => ({
  MariaDBRouteRepository: vi.fn(() => ({
    findByStatus: vi.fn().mockResolvedValue([]),
  })),
  CalculateNextPointUseCase: vi.fn(),
  FindNearestCityUseCase: vi.fn(),
  GeocodePlaceUseCase: vi.fn(),
  GeocodePointUseCase: vi.fn(),
  OverpassAdapter: vi.fn(),
  NominatimAdapter: vi.fn(),
}));

vi.mock('@silicon-traveler/research', () => ({
  BraveSearchAdapter: vi.fn(),
}));

vi.mock('@silicon-traveler/content', () => ({
  OpenAIAdapter: vi.fn(),
}));

vi.mock('@silicon-traveler/image', () => ({
  DalleAdapter: vi.fn(),
  SharpAdapter: vi.fn(),
}));

vi.mock('@silicon-traveler/storage', () => ({
  LocalStorageAdapter: vi.fn(),
}));

const prepareNextPhotoExecute = vi.fn().mockResolvedValue({
  routePointId: 10,
  journeyId: 1,
  sequence: 1,
  placeName: 'Test Place',
  region: 'Test Region',
  country: 'Test Country',
  coordinates: { lat: 1, lng: 1 },
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

vi.mock('@silicon-traveler/photo', () => ({
  PreparePhotoUseCase: vi.fn(),
  PreparePhotoPromptsUseCase: vi.fn(),
  PrepareNextPhotoUseCase: vi.fn(() => ({
    execute: prepareNextPhotoExecute,
  })),
  MariaDBPhotoRepository: vi.fn(),
}));

import { preparePrompts } from '../../../src/commands/prepare-prompts';
import { pool } from '@silicon-traveler/shared';

const poolEnd = vi.mocked(pool.end);

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
