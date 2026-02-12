import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { SyncPublishedPhotoFromRoutePointUseCase } from '../../../src/application/sync-published-photo-from-route-point.use-case';

describe('SyncPublishedPhotoFromRoutePointUseCase', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.I18N_LANGUAGES = 'es,en';
    process.env.I18N_DEFAULT_LANGUAGE = 'es';
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('builds localized title/location and delegates to repository', async () => {
    const photoRepository = {
      syncPublishedPhotoFromRoutePoint: vi.fn().mockResolvedValue(undefined),
    };

    const useCase = new SyncPublishedPhotoFromRoutePointUseCase(photoRepository as any);

    await useCase.execute({
      routePointId: 10,
      placeName: 'Gijon',
      region: 'Asturias',
      country: 'Spain',
      coordinates: { lat: 43.53, lng: -5.66 },
    });

    expect(photoRepository.syncPublishedPhotoFromRoutePoint).toHaveBeenCalledWith({
      routePointId: 10,
      title: 'Gijon',
      location: 'Gijon, Asturias, Spain',
      coordinates: { lat: 43.53, lng: -5.66 },
      translations: [
        {
          language: 'es',
          title: 'Gijon',
          location: 'Gijon, Asturias, Spain',
        },
        {
          language: 'en',
          title: 'Gijon',
          location: 'Gijon, Asturias, Spain',
        },
      ],
    }, undefined);
  });

  it('uses language fallback values when place fields are empty', async () => {
    const photoRepository = {
      syncPublishedPhotoFromRoutePoint: vi.fn().mockResolvedValue(undefined),
    };

    const useCase = new SyncPublishedPhotoFromRoutePointUseCase(photoRepository as any);

    await useCase.execute({
      routePointId: 99,
      placeName: null,
      region: null,
      country: null,
      coordinates: { lat: 0, lng: 0 },
    });

    const input = photoRepository.syncPublishedPhotoFromRoutePoint.mock.calls[0][0];
    expect(input.title).toBe('Lugar desconocido');
    expect(input.location).toBe('Ubicación desconocida');
    expect(input.translations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          language: 'en',
          title: 'Unknown place',
          location: 'Unknown location',
        }),
      ])
    );
  });
});
