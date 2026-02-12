import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { pool } from '@silicon-traveler/shared';
import { RoutePoint } from '@silicon-traveler/route';
import { UpdateAdminRoutePointUseCase } from '../../../../src/application/admin/update-admin-route-point.use-case';

const createRoutePoint = (status: 'image_ready' | 'published' | 'pending') =>
  new RoutePoint(
    10,
    1,
    1,
    'Madrid',
    { lat: 40.4168, lng: -3.7038 },
    'Spain',
    'Community of Madrid',
    false,
    null,
    null,
    null,
    'prompt',
    'narrative',
    { camera: 'Leica M11', lens: '35mm f/1.4', iso: 400, shutterSpeed: '1/125', aperture: 'f/2.8' },
    status,
    null,
    '/images/2026/02/12/10.jpg',
    '/images/2026/02/12/10_grid.jpg',
    new Date('2026-02-12T00:00:00Z'),
    status === 'published' ? new Date('2026-02-12T00:00:00Z') : null,
    new Date('2026-02-12T00:00:00Z')
  );

describe('UpdateAdminRoutePointUseCase', () => {
  const routeRepository = {
    findById: vi.fn(),
    upsertContentTranslations: vi.fn(),
  };
  const photoRepository = {
    hasByRoutePointId: vi.fn(),
    deleteByRoutePointId: vi.fn(),
  };
  const updateRoutePointAdminUseCase = {
    execute: vi.fn(),
  };
  const publishPhotoUseCase = {
    execute: vi.fn(),
  };
  const syncPublishedPhotoFromRoutePointUseCase = {
    execute: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('publishes image-ready route point atomically when no photo exists', async () => {
    const currentRoutePoint = createRoutePoint('image_ready');
    const updatedRoutePoint = createRoutePoint('image_ready');
    routeRepository.findById.mockResolvedValue(currentRoutePoint);
    routeRepository.upsertContentTranslations.mockResolvedValue(undefined);
    photoRepository.hasByRoutePointId.mockResolvedValue(false);
    photoRepository.deleteByRoutePointId.mockResolvedValue(false);
    updateRoutePointAdminUseCase.execute.mockResolvedValue(updatedRoutePoint);
    publishPhotoUseCase.execute.mockResolvedValue(99);
    syncPublishedPhotoFromRoutePointUseCase.execute.mockResolvedValue(undefined);

    const connection = {
      beginTransaction: vi.fn().mockResolvedValue(undefined),
      commit: vi.fn().mockResolvedValue(undefined),
      rollback: vi.fn().mockResolvedValue(undefined),
      release: vi.fn(),
      query: vi.fn(),
    };
    vi.spyOn(pool, 'getConnection').mockResolvedValue(connection as any);

    const useCase = new UpdateAdminRoutePointUseCase(
      routeRepository as any,
      photoRepository as any,
      updateRoutePointAdminUseCase as any,
      publishPhotoUseCase as any,
      syncPublishedPhotoFromRoutePointUseCase as any
    );

    const result = await useCase.execute({
      id: 10,
      status: 'published',
      translations: [{ language: 'en', imagePrompt: 'Prompt', narrative: 'Narrative' }],
    });

    expect(result.id).toBe(10);
    expect(routeRepository.findById).toHaveBeenCalledWith(10, connection);
    expect(updateRoutePointAdminUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({ id: 10, status: undefined }),
      { queryExecutor: connection }
    );
    expect(routeRepository.upsertContentTranslations).toHaveBeenCalledWith(
      10,
      [{ language: 'en', imagePrompt: 'Prompt', narrative: 'Narrative' }],
      connection
    );
    expect(publishPhotoUseCase.execute).toHaveBeenCalledWith(
      10,
      expect.objectContaining({ imageUrl: '/images/2026/02/12/10.jpg' }),
      { queryExecutor: connection }
    );
    expect(syncPublishedPhotoFromRoutePointUseCase.execute).not.toHaveBeenCalled();
    expect(photoRepository.deleteByRoutePointId).not.toHaveBeenCalled();
    expect(connection.commit).toHaveBeenCalledTimes(1);
    expect(connection.rollback).not.toHaveBeenCalled();
  });

  it('removes photo row when unpublishing from published status', async () => {
    const currentRoutePoint = createRoutePoint('published');
    const updatedRoutePoint = createRoutePoint('image_ready');
    routeRepository.findById.mockResolvedValue(currentRoutePoint);
    routeRepository.upsertContentTranslations.mockResolvedValue(undefined);
    updateRoutePointAdminUseCase.execute.mockResolvedValue(updatedRoutePoint);
    photoRepository.deleteByRoutePointId.mockResolvedValue(true);

    const connection = {
      beginTransaction: vi.fn().mockResolvedValue(undefined),
      commit: vi.fn().mockResolvedValue(undefined),
      rollback: vi.fn().mockResolvedValue(undefined),
      release: vi.fn(),
      query: vi.fn(),
    };
    vi.spyOn(pool, 'getConnection').mockResolvedValue(connection as any);

    const useCase = new UpdateAdminRoutePointUseCase(
      routeRepository as any,
      photoRepository as any,
      updateRoutePointAdminUseCase as any,
      publishPhotoUseCase as any,
      syncPublishedPhotoFromRoutePointUseCase as any
    );

    await useCase.execute({ id: 10, status: 'image_ready' });

    expect(photoRepository.hasByRoutePointId).not.toHaveBeenCalled();
    expect(photoRepository.deleteByRoutePointId).toHaveBeenCalledWith(10, connection);
    expect(publishPhotoUseCase.execute).not.toHaveBeenCalled();
    expect(syncPublishedPhotoFromRoutePointUseCase.execute).not.toHaveBeenCalled();
    expect(connection.commit).toHaveBeenCalledTimes(1);
  });

  it('rolls back transaction when publishing fails', async () => {
    const currentRoutePoint = createRoutePoint('image_ready');
    const updatedRoutePoint = createRoutePoint('image_ready');
    routeRepository.findById.mockResolvedValue(currentRoutePoint);
    updateRoutePointAdminUseCase.execute.mockResolvedValue(updatedRoutePoint);
    photoRepository.hasByRoutePointId.mockResolvedValue(false);
    publishPhotoUseCase.execute.mockRejectedValue(new Error('publish failed'));

    const connection = {
      beginTransaction: vi.fn().mockResolvedValue(undefined),
      commit: vi.fn().mockResolvedValue(undefined),
      rollback: vi.fn().mockResolvedValue(undefined),
      release: vi.fn(),
      query: vi.fn(),
    };
    vi.spyOn(pool, 'getConnection').mockResolvedValue(connection as any);

    const useCase = new UpdateAdminRoutePointUseCase(
      routeRepository as any,
      photoRepository as any,
      updateRoutePointAdminUseCase as any,
      publishPhotoUseCase as any,
      syncPublishedPhotoFromRoutePointUseCase as any
    );

    await expect(useCase.execute({ id: 10, status: 'published' })).rejects.toThrow('publish failed');

    expect(connection.commit).not.toHaveBeenCalled();
    expect(connection.rollback).toHaveBeenCalledTimes(1);
  });
});
