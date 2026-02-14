import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PrepareNextPhotoUseCase } from '../../../src/application/prepare-next-photo.use-case';
import { Journey } from '@silicon-traveler/journey';

vi.mock('@silicon-traveler/shared', async () => {
  const actual = await vi.importActual<typeof import('@silicon-traveler/shared')>('@silicon-traveler/shared');
  return {
    ...actual,
    calculateDistance: vi.fn(() => 42),
  };
});

const createJourney = (heading: string = 'east') =>
  new Journey(
    1,
    'Test Journey',
    { lat: 0, lng: 0 },
    { lat: 0, lng: 0 },
    heading,
    new Date('2026-01-01T00:00:00Z'),
    new Date('2026-01-01T00:00:00Z'),
    new Date('2026-01-01T00:00:00Z')
  );

const createRoutePoint = (travelMode: 'land' | 'air' = 'land') =>
  ({
    id: 10,
    journeyId: 1,
    sequence: 1,
    placeName: 'Test City',
    coordinates: { lat: 1, lng: 1 },
    country: 'Testland',
    region: 'Test Region',
    isFferryCrossing: false,
    distanceFromPrevious: 42,
    osmData: null,
    researchSummary: null,
    imagePrompt: null,
    narrativePrompt: null,
    cameraMetadata: null,
    status: 'pending',
    errorMessage: null,
    imagePath: null,
    thumbnailPath: null,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    publishedAt: null,
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    travelMode,
    updateStatus(status: 'pending' | 'researched' | 'content_generated' | 'image_ready' | 'published' | 'failed', errorMessage: string | null = null) {
      this.status = status;
      this.errorMessage = errorMessage;
      this.updatedAt = new Date();
    },
  }) as any;

describe('PrepareNextPhotoUseCase', () => {
  const journeyRepository = {
    findById: vi.fn(),
    update: vi.fn(),
  };
  const routeRepository = {
    findByStatus: vi.fn(),
    getLastSequence: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  };
  const calculateNextPoint = { execute: vi.fn() };
  const planEastwardStep = { execute: vi.fn() };
  const findAirLandingEast = { execute: vi.fn() };
  const findNearestCity = { execute: vi.fn() };
  const geocodePoint = { execute: vi.fn() };
  const preparePhotoUseCase = { execute: vi.fn() };
  const preparePhotoPromptsUseCase = { execute: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses an existing pending route point when available', async () => {
    const journey = createJourney();
    const pendingPoint = createRoutePoint();

    journeyRepository.findById.mockResolvedValue(journey);
    routeRepository.findByStatus.mockResolvedValue([pendingPoint]);
    preparePhotoUseCase.execute.mockResolvedValue({
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
    });

    const useCase = new PrepareNextPhotoUseCase(
      journeyRepository as any,
      routeRepository as any,
      calculateNextPoint as any,
      planEastwardStep as any,
      findAirLandingEast as any,
      findNearestCity as any,
      geocodePoint as any,
      preparePhotoUseCase as any,
      preparePhotoPromptsUseCase as any
    );

    const result = await useCase.execute({ journeyId: 1 });

    expect(result.createdNewRoutePoint).toBe(false);
    expect(result.routePointId).toBe(10);
    expect(result.travelMode).toBe('land');
    expect(preparePhotoUseCase.execute).toHaveBeenCalledWith(10);
    expect(routeRepository.create).not.toHaveBeenCalled();
    expect(routeRepository.update).not.toHaveBeenCalled();
    expect(journeyRepository.update).not.toHaveBeenCalled();
  });

  it('creates a new land route point when eastward planning succeeds', async () => {
    const journey = createJourney('sideways');
    const createdRoutePoint = createRoutePoint('land');

    journeyRepository.findById.mockResolvedValue(journey);
    routeRepository.findByStatus.mockResolvedValue([]);
    routeRepository.getLastSequence.mockResolvedValue(4);
    planEastwardStep.execute.mockResolvedValue({
      coordinates: { lat: 2, lng: 2 },
      travelMode: 'land',
      distanceFromPrevious: 24,
    });
    findNearestCity.execute.mockResolvedValue(null);
    geocodePoint.execute.mockResolvedValue({
      country: 'Country',
      region: 'Region',
      displayName: 'Display',
      placeName: 'Known Place',
    });
    routeRepository.create.mockResolvedValue(createdRoutePoint);
    preparePhotoUseCase.execute.mockResolvedValue({
      imageUrl: '/images/2.jpg',
      gridThumbnailUrl: '/images/2_grid.jpg',
      heroThumbnailUrl: '/images/2_hero.jpg',
      narrative: 'Narrative',
      camera: 'Leica',
      lens: '35mm',
      iso: 200,
      shutterSpeed: '1/200',
      aperture: 'f/4',
      revisedPrompt: null,
    });

    const useCase = new PrepareNextPhotoUseCase(
      journeyRepository as any,
      routeRepository as any,
      calculateNextPoint as any,
      planEastwardStep as any,
      findAirLandingEast as any,
      findNearestCity as any,
      geocodePoint as any,
      preparePhotoUseCase as any,
      preparePhotoPromptsUseCase as any
    );

    const result = await useCase.execute({ journeyId: 1 });

    expect(result.createdNewRoutePoint).toBe(true);
    expect(result.travelMode).toBe('land');
    expect(planEastwardStep.execute).toHaveBeenCalled();
    expect(findAirLandingEast.execute).not.toHaveBeenCalled();
    expect(routeRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        journeyId: 1,
        sequence: 5,
        isFferryCrossing: false,
        travelMode: 'land',
      })
    );
    expect(journeyRepository.update).toHaveBeenCalledWith(journey);
  });

  it('creates an air route point when no land route can be planned', async () => {
    const journey = createJourney('east');
    const createdRoutePoint = createRoutePoint('air');

    journeyRepository.findById.mockResolvedValue(journey);
    routeRepository.findByStatus.mockResolvedValue([]);
    routeRepository.getLastSequence.mockResolvedValue(1);
    planEastwardStep.execute.mockResolvedValue(null);
    findAirLandingEast.execute.mockResolvedValue({
      coordinates: { lat: 5, lng: 8 },
      travelMode: 'air',
      distanceFromPrevious: 780,
      placeName: 'Air City',
      country: 'Country',
      region: 'Region',
      osmData: { place: 'city' },
    });
    geocodePoint.execute.mockResolvedValue({
      country: 'Country',
      region: 'Region',
      displayName: 'Display',
      placeName: 'Air City',
    });
    routeRepository.create.mockResolvedValue(createdRoutePoint);
    preparePhotoUseCase.execute.mockResolvedValue({
      imageUrl: '/images/3.jpg',
      gridThumbnailUrl: '/images/3_grid.jpg',
      heroThumbnailUrl: '/images/3_hero.jpg',
      narrative: 'Narrative',
      camera: 'Leica',
      lens: '35mm',
      iso: 200,
      shutterSpeed: '1/200',
      aperture: 'f/4',
      revisedPrompt: null,
    });

    const useCase = new PrepareNextPhotoUseCase(
      journeyRepository as any,
      routeRepository as any,
      calculateNextPoint as any,
      planEastwardStep as any,
      findAirLandingEast as any,
      findNearestCity as any,
      geocodePoint as any,
      preparePhotoUseCase as any,
      preparePhotoPromptsUseCase as any
    );

    const result = await useCase.execute({ journeyId: 1 });

    expect(result.createdNewRoutePoint).toBe(true);
    expect(result.travelMode).toBe('air');
    expect(findAirLandingEast.execute).toHaveBeenCalledWith({ currentPosition: { lat: 0, lng: 0 } });
    expect(routeRepository.create).toHaveBeenCalledWith(expect.objectContaining({ travelMode: 'air' }));
    expect(findNearestCity.execute).not.toHaveBeenCalled();
  });

  it('uses the prompts-only pipeline when configured', async () => {
    const journey = createJourney();
    const pendingPoint = createRoutePoint();

    journeyRepository.findById.mockResolvedValue(journey);
    routeRepository.findByStatus.mockResolvedValue([pendingPoint]);
    preparePhotoPromptsUseCase.execute.mockResolvedValue({
      routePointId: 10,
      journeyId: 1,
      sequence: 1,
      placeName: null,
      region: null,
      country: null,
      coordinates: { lat: 1, lng: 1 },
      isFerryCrossing: false,
      travelMode: 'land',
      researchQuery: 'Query',
      researchSummary: '',
      llmSystemPrompt: 'system',
      llmUserPrompt: 'user',
      contentStatus: 'generated',
      imagePrompt: 'Prompt',
      narrative: 'Narrative',
      cameraMetadata: {
        camera: 'Leica',
        lens: '35mm',
        iso: 100,
        shutterSpeed: '1/100',
        aperture: 'f/2.8',
      },
    });

    const useCase = new PrepareNextPhotoUseCase(
      journeyRepository as any,
      routeRepository as any,
      calculateNextPoint as any,
      planEastwardStep as any,
      findAirLandingEast as any,
      findNearestCity as any,
      geocodePoint as any,
      preparePhotoUseCase as any,
      preparePhotoPromptsUseCase as any,
      { mode: 'prompts-only', minDistanceKm: 20, maxDistanceKm: 30, cityRadiusKm: 10, pendingSearchLimit: 20 }
    );

    const result = await useCase.execute({ journeyId: 1 });

    expect(result.mode).toBe('prompts-only');
    expect(preparePhotoPromptsUseCase.execute).toHaveBeenCalledWith(10);
    expect(preparePhotoUseCase.execute).not.toHaveBeenCalled();
  });

  it('fails when the place name is unknown and marks the route point as failed', async () => {
    const journey = createJourney();
    const pendingPoint = createRoutePoint();
    pendingPoint.placeName = null;

    journeyRepository.findById.mockResolvedValue(journey);
    routeRepository.findByStatus.mockResolvedValue([pendingPoint]);

    const useCase = new PrepareNextPhotoUseCase(
      journeyRepository as any,
      routeRepository as any,
      calculateNextPoint as any,
      planEastwardStep as any,
      findAirLandingEast as any,
      findNearestCity as any,
      geocodePoint as any,
      preparePhotoUseCase as any,
      preparePhotoPromptsUseCase as any
    );

    await expect(useCase.execute({ journeyId: 1 })).rejects.toThrow('Unknown place');

    expect(pendingPoint.status).toBe('failed');
    expect(pendingPoint.errorMessage).toBe('Unknown place');
    expect(routeRepository.update).toHaveBeenCalledWith(pendingPoint);
    expect(preparePhotoUseCase.execute).not.toHaveBeenCalled();
    expect(preparePhotoPromptsUseCase.execute).not.toHaveBeenCalled();
  });
});
