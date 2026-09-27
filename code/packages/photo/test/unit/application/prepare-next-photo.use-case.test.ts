import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PrepareNextPhotoUseCase } from '../../../src/application/prepare-next-photo.use-case';
import { Journey } from '@silicon-traveler/journey';
import { RoutePoint } from '@silicon-traveler/route';

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

const createRoutePoint = () =>
  new RoutePoint(
    10,
    1,
    1,
    'Test City',
    { lat: 1, lng: 1 },
    'Testland',
    'Test Region',
    42,
    null,
    null,
    null,
    null,
    null,
    'pending',
    null,
    null,
    null,
    new Date('2026-01-01T00:00:00Z'),
    null,
    new Date('2026-01-01T00:00:00Z')
  );

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
  const resolveNextStop = { execute: vi.fn() };
  const preparePhotoUseCase = { execute: vi.fn() };
  const preparePhotoPromptsUseCase = { execute: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createUseCase = (config = {}) => new PrepareNextPhotoUseCase(
    journeyRepository as any, routeRepository as any, resolveNextStop as any,
    preparePhotoUseCase as any, preparePhotoPromptsUseCase as any, config
  );

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

    const useCase = createUseCase();

    const result = await useCase.execute({ journeyId: 1 });

    expect(result.createdNewRoutePoint).toBe(false);
    expect(result.routePointId).toBe(10);
    expect(preparePhotoUseCase.execute).toHaveBeenCalledWith(10);
    expect(routeRepository.create).not.toHaveBeenCalled();
    expect(routeRepository.update).not.toHaveBeenCalled();
    expect(journeyRepository.update).not.toHaveBeenCalled();
    expect(resolveNextStop.execute).not.toHaveBeenCalled();
  });

  it('creates a new route point when none exist', async () => {
    const journey = createJourney('sideways');

    const createdRoutePoint = createRoutePoint();

    journeyRepository.findById.mockResolvedValue(journey);
    routeRepository.findByStatus.mockResolvedValue([]);
    routeRepository.getLastSequence.mockResolvedValue(4);
    resolveNextStop.execute.mockResolvedValue({ coordinates: { lat: 3, lng: 3 }, distanceFromOrigin: 42, placeName: 'Test City', country: 'Testland', region: 'Test Region', osmData: null });
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

    const useCase = createUseCase();
    const result = await useCase.execute({ journeyId: 1 });

    expect(result.createdNewRoutePoint).toBe(true);
    expect(resolveNextStop.execute).toHaveBeenCalledWith({
      origin: { lat: 0, lng: 0 },
      heading: 'east',
      minDistanceKm: 20,
      maxDistanceKm: 30,
      cityRadiusKm: 10,
    });
    expect(routeRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        journeyId: 1,
        sequence: 5,
        distanceFromPrevious: 42,
      })
    );
    expect(routeRepository.update).toHaveBeenCalledWith(createdRoutePoint);
    expect(journeyRepository.update).toHaveBeenCalledWith(journey);
    expect(createdRoutePoint.coordinates).toEqual({ lat: 3, lng: 3 });
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

    const useCase = createUseCase({ mode: 'prompts-only', minDistanceKm: 20, maxDistanceKm: 30, cityRadiusKm: 10, pendingSearchLimit: 20 });

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

    const useCase = createUseCase();

    await expect(useCase.execute({ journeyId: 1 })).rejects.toThrow('Unknown place');

    expect(pendingPoint.status).toBe('failed');
    expect(pendingPoint.errorMessage).toBe('Unknown place');
    expect(routeRepository.update).toHaveBeenCalledWith(pendingPoint);
    expect(preparePhotoUseCase.execute).not.toHaveBeenCalled();
    expect(preparePhotoPromptsUseCase.execute).not.toHaveBeenCalled();
  });
});
