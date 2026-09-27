import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PublishPhotoUseCase } from '../../../src/application/publish-photo.use-case';

describe('PublishPhotoUseCase', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.I18N_LANGUAGES = 'es,en';
    process.env.I18N_DEFAULT_LANGUAGE = 'es';
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('creates a photo and updates route status', async () => {
    const routePoint = {
      id: 10,
      journeyId: 1,
      sequence: 1,
      status: 'image_ready',
      placeName: 'Porto',
      region: 'Porto District',
      country: 'Portugal',
      coordinates: { lat: 41.15, lng: -8.61 },
      osmData: { place: 'city' },
      imagePrompt: 'Prompt',
      updateStatus: vi.fn(),
    };

    const routeRepo = {
      findById: vi.fn().mockResolvedValue(routePoint),
      update: vi.fn().mockResolvedValue(undefined),
      findContentTranslations: vi.fn().mockResolvedValue([
        { language: 'es', imagePrompt: 'Prompt ES', narrative: 'Narrativa' },
        { language: 'en', imagePrompt: 'Prompt', narrative: 'Narrative' },
      ]),
    };

    const photoRepo = {
      create: vi.fn().mockResolvedValue(99),
    };

    const useCase = new PublishPhotoUseCase(photoRepo as any, routeRepo as any);
    const preparedPhoto = {
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
    };

    const photoId = await useCase.execute(10, preparedPhoto);

    expect(photoId).toBe(99);
    const createdInput = photoRepo.create.mock.calls[0][0];
    expect(createdInput).toEqual(
      expect.objectContaining({
        routePointId: 10,
        title: 'Porto',
        location: 'Porto, Porto District, Portugal',
        rollNumber: 'ROLL 01',
        frameNumber: '01',
      })
    );
    expect(createdInput.translations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          language: 'es',
          title: 'Porto',
          location: 'Porto, Porto District, Portugal',
          narrative: 'Narrativa',
        }),
        expect.objectContaining({
          language: 'en',
          title: 'Porto',
          location: 'Porto, Porto District, Portugal',
          narrative: 'Narrative',
        }),
      ])
    );
    expect(createdInput.tags).toEqual(
      expect.arrayContaining(['porto', 'porto district', 'portugal', 'city', 'documentary'])
    );
    expect(createdInput.metadata).toMatchObject({
      aperture: 'f/2.8',
      revisedPrompt: null,
      imagePrompt: 'Prompt',
    });
    expect(routePoint.updateStatus).toHaveBeenCalledWith('published');
    expect(routeRepo.update).toHaveBeenCalledWith(routePoint, undefined);
  });
});
