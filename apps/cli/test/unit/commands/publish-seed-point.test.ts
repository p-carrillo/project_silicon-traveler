import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  poolEnd: vi.fn().mockResolvedValue(undefined),
  calculateDistance: vi.fn().mockReturnValue(24.6),
  journeyUpdate: vi.fn().mockResolvedValue(undefined),
  journeyFindById: vi.fn(),
  journeyFindActive: vi.fn(),
  journeyCreate: vi.fn(),
  routeGetLastSequence: vi.fn().mockResolvedValue(7),
  routeCreate: vi.fn(),
  routeUpdate: vi.fn().mockResolvedValue(undefined),
  routeFindFirstScheduledByJourney: vi.fn().mockResolvedValue({ sequence: 1 }),
  calculateNextPointExecute: vi.fn().mockReturnValue({ lat: 43.5, lng: -7.9 }),
  findNearestCityExecute: vi.fn().mockResolvedValue({
    name: 'Ribadeo',
    lat: 43.31,
    lon: -7.88,
    tags: { place: 'town' },
  }),
  geocodePlaceExecute: vi.fn().mockResolvedValue(null),
  geocodePointExecute: vi.fn().mockResolvedValue({
    placeName: 'Ribadeo',
    country: 'Spain',
    region: 'Galicia',
    displayName: 'Ribadeo, Galicia, Spain',
  }),
  saveImage: vi.fn(),
  saveThumbnail: vi.fn(),
  publishExecute: vi.fn().mockResolvedValue(501),
}));

vi.mock('fs/promises', () => ({
  default: {
    readdir: vi.fn().mockResolvedValue([
      { name: 'seed-photo-01.jpg', isFile: () => true },
      { name: 'seed-photo-02.jpg', isFile: () => true },
    ]),
    readFile: vi.fn().mockResolvedValue(Buffer.from('seed-image')),
  },
}));

vi.mock('@silicon-traveler/shared', () => ({
  pool: { end: mocks.poolEnd },
  calculateDistance: mocks.calculateDistance,
}));

vi.mock('@silicon-traveler/journey', () => ({
  Journey: {
    create: vi.fn((_name: string, origin: { lat: number; lng: number }, heading: string) => ({
      name: 'Around the World on Foot',
      originPoint: origin,
      currentPosition: origin,
      heading,
      startedAt: new Date('2026-02-26T00:00:00.000Z'),
    })),
  },
  MariaDBJourneyRepository: vi.fn(() => ({
    findById: mocks.journeyFindById,
    findActive: mocks.journeyFindActive,
    create: mocks.journeyCreate,
    update: mocks.journeyUpdate,
  })),
}));

vi.mock('@silicon-traveler/route', () => ({
  MariaDBRouteRepository: vi.fn(() => ({
    getLastSequence: mocks.routeGetLastSequence,
    create: mocks.routeCreate,
    update: mocks.routeUpdate,
    findFirstScheduledByJourney: mocks.routeFindFirstScheduledByJourney,
  })),
  CalculateNextPointUseCase: vi.fn(() => ({
    execute: mocks.calculateNextPointExecute,
  })),
  FindNearestCityUseCase: vi.fn(() => ({
    execute: mocks.findNearestCityExecute,
  })),
  GeocodePlaceUseCase: vi.fn(() => ({
    execute: mocks.geocodePlaceExecute,
  })),
  GeocodePointUseCase: vi.fn(() => ({
    execute: mocks.geocodePointExecute,
  })),
  OverpassAdapter: vi.fn(),
  NominatimAdapter: vi.fn(),
}));

vi.mock('@silicon-traveler/storage', () => ({
  LocalStorageAdapter: vi.fn(() => ({
    saveImage: mocks.saveImage,
    saveThumbnail: mocks.saveThumbnail,
  })),
}));

vi.mock('@silicon-traveler/photo', () => ({
  MariaDBPhotoRepository: vi.fn(),
  PublishPhotoUseCase: vi.fn(() => ({
    execute: mocks.publishExecute,
  })),
}));

import { publishSeedPoint } from '../../../src/commands/publish-seed-point';

function primeStorageMocks(imageUrl: string, gridUrl: string, heroUrl: string): void {
  mocks.saveImage.mockResolvedValue(imageUrl ? { url: imageUrl } : null);
  mocks.saveThumbnail
    .mockReset()
    .mockResolvedValueOnce({ url: gridUrl })
    .mockResolvedValueOnce({ url: heroUrl });
}

function buildRoutePoint(id: number, input: {
  journeyId: number;
  sequence: number;
  placeName: string | null;
  coordinates: { lat: number; lng: number };
  country: string | null;
  region: string | null;
  status: string;
  thumbnailPath: string | null;
  imagePath: string | null;
  osmData: unknown;
  researchSummary: string | null;
  imagePrompt: string | null;
  narrativePrompt: string | null;
  cameraMetadata: unknown;
}): {
  id: number;
  journeyId: number;
  sequence: number;
  placeName: string | null;
  coordinates: { lat: number; lng: number };
  country: string | null;
  region: string | null;
  status: string;
  imagePath: string | null;
  thumbnailPath: string | null;
  osmData: unknown;
  researchSummary: string | null;
  imagePrompt: string | null;
  narrativePrompt: string | null;
  cameraMetadata: unknown;
  updateResearch: (summary: string, osmData: unknown) => void;
  updateContent: (prompt: string, narrative: string, cameraMetadata: unknown) => void;
  updateImages: (imagePath: string, thumbnailPath: string) => void;
} {
  return {
    id,
    journeyId: input.journeyId,
    sequence: input.sequence,
    placeName: input.placeName,
    coordinates: input.coordinates,
    country: input.country,
    region: input.region,
    status: input.status,
    imagePath: input.imagePath,
    thumbnailPath: input.thumbnailPath,
    osmData: input.osmData,
    researchSummary: input.researchSummary,
    imagePrompt: input.imagePrompt,
    narrativePrompt: input.narrativePrompt,
    cameraMetadata: input.cameraMetadata,
    updateResearch(summary: string, osmData: unknown) {
      this.researchSummary = summary;
      this.osmData = osmData;
      this.status = 'researched';
    },
    updateContent(prompt: string, narrative: string, cameraMetadata: unknown) {
      this.imagePrompt = prompt;
      this.narrativePrompt = narrative;
      this.cameraMetadata = cameraMetadata;
      this.status = 'content_generated';
    },
    updateImages(imagePath: string, thumbnailPath: string) {
      this.imagePath = imagePath;
      this.thumbnailPath = thumbnailPath;
      this.status = 'image_ready';
    },
  };
}

describe('publishSeedPoint', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('creates and publishes one new route point using seed image data', async () => {
    primeStorageMocks(
      '/images/2026/02/26/88.jpg',
      '/images/2026/02/26/88_grid.jpg',
      '/images/2026/02/26/88_hero.jpg'
    );
    const journey = {
      id: 1,
      heading: 'east',
      currentPosition: { lat: 43.36, lng: -8.41 },
      updatePosition: vi.fn(function updatePosition(newPosition: { lat: number; lng: number }) {
        this.currentPosition = newPosition;
      }),
    };
    mocks.journeyFindById.mockResolvedValue(journey);
    mocks.geocodePlaceExecute.mockResolvedValue({
      coordinates: { lat: 43.31, lng: -7.88 },
      placeName: 'Ribadeo',
      country: 'Spain',
      region: 'Galicia',
      displayName: 'Ribadeo, Galicia, Spain',
    });

    mocks.routeCreate.mockImplementation(async (input: {
      journeyId: number;
      sequence: number;
      placeName: string | null;
      coordinates: { lat: number; lng: number };
      country: string | null;
      region: string | null;
      status: string;
      thumbnailPath: string | null;
      imagePath: string | null;
      osmData: unknown;
      researchSummary: string | null;
      imagePrompt: string | null;
      narrativePrompt: string | null;
      cameraMetadata: unknown;
    }) => buildRoutePoint(88, input));

    const result = await publishSeedPoint({
      journeyId: 1,
      mapRefresh: false,
    });

    expect(mocks.routeCreate).toHaveBeenCalledTimes(1);
    expect(mocks.routeCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        journeyId: 1,
        sequence: 8,
        status: 'pending',
      })
    );
    expect(mocks.routeUpdate).toHaveBeenCalledTimes(3);
    expect(mocks.saveImage).toHaveBeenCalledTimes(1);
    expect(mocks.saveThumbnail).toHaveBeenCalledTimes(2);
    expect(mocks.publishExecute).toHaveBeenCalledWith(
      88,
      expect.objectContaining({
        imageUrl: '/images/2026/02/26/88.jpg',
        gridThumbnailUrl: '/images/2026/02/26/88_grid.jpg',
        heroThumbnailUrl: '/images/2026/02/26/88_hero.jpg',
      })
    );
    expect(mocks.journeyUpdate).toHaveBeenCalledTimes(1);
    expect(mocks.poolEnd).toHaveBeenCalledTimes(1);
    expect(result).toEqual(
      expect.objectContaining({
        journeyId: 1,
        routePointId: 88,
        sequence: 8,
        photoId: 501,
        coordinates: { lat: 43.31, lng: -7.88 },
      })
    );
  });

  it('creates a journey from Oleiros when none exists', async () => {
    primeStorageMocks(
      '/images/2026/02/26/101.jpg',
      '/images/2026/02/26/101_grid.jpg',
      '/images/2026/02/26/101_hero.jpg'
    );

    const createdJourney = {
      id: 1,
      heading: 'east',
      currentPosition: { lat: 43.3328, lng: -8.3186 },
      updatePosition: vi.fn(function updatePosition(newPosition: { lat: number; lng: number }) {
        this.currentPosition = newPosition;
      }),
    };
    mocks.journeyFindById.mockResolvedValue(null);
    mocks.journeyFindActive.mockResolvedValue(null);
    mocks.journeyCreate.mockResolvedValue(createdJourney);
    mocks.routeGetLastSequence.mockResolvedValue(0);
    mocks.geocodePlaceExecute.mockResolvedValue(null);

    mocks.routeCreate
      .mockImplementationOnce(async (input: {
        journeyId: number;
        sequence: number;
        placeName: string | null;
        coordinates: { lat: number; lng: number };
        country: string | null;
        region: string | null;
      }) => ({
        id: 100,
        journeyId: input.journeyId,
        sequence: input.sequence,
        placeName: input.placeName,
        coordinates: input.coordinates,
        country: input.country,
        region: input.region,
        status: 'pending',
        imagePath: null,
        thumbnailPath: null,
        osmData: null,
        researchSummary: null,
        imagePrompt: null,
        narrativePrompt: null,
        cameraMetadata: null,
      }))
      .mockImplementationOnce(async (input: {
        journeyId: number;
        sequence: number;
        placeName: string | null;
        coordinates: { lat: number; lng: number };
        country: string | null;
        region: string | null;
        status: string;
        thumbnailPath: string | null;
        imagePath: string | null;
        osmData: unknown;
        researchSummary: string | null;
        imagePrompt: string | null;
        narrativePrompt: string | null;
        cameraMetadata: unknown;
      }) => buildRoutePoint(101, input));

    const result = await publishSeedPoint({
      journeyId: 1,
      mapRefresh: false,
    });

    expect(mocks.journeyCreate).toHaveBeenCalledTimes(1);
    expect(mocks.routeCreate).toHaveBeenCalledTimes(2);
    expect(mocks.routeCreate).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        sequence: 0,
        placeName: 'Oleiros',
        country: 'Spain',
        region: 'Galicia',
      })
    );
    expect(mocks.routeCreate).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        sequence: 1,
        status: 'pending',
      })
    );
    expect(mocks.publishExecute).toHaveBeenCalledWith(
      101,
      expect.objectContaining({
        imageUrl: '/images/2026/02/26/101.jpg',
      })
    );
    expect(result).toEqual(
      expect.objectContaining({
        journeyId: 1,
        routePointId: 101,
        sequence: 1,
        photoId: 501,
      })
    );
  });

  it('validates journey id before doing work', async () => {
    await expect(
      publishSeedPoint({
        journeyId: 0,
        mapRefresh: false,
      })
    ).rejects.toThrow('Journey ID must be a positive number');

    expect(mocks.journeyFindById).not.toHaveBeenCalled();
    expect(mocks.poolEnd).not.toHaveBeenCalled();
  });
});
