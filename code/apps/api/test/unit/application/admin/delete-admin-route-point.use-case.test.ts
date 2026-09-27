import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RoutePoint } from '@silicon-traveler/route';
import { pool } from '@silicon-traveler/shared';
import { DeleteAdminRoutePointUseCase } from '../../../../src/application/admin/delete-admin-route-point.use-case';

const createRoutePoint = () =>
  new RoutePoint(
    10,
    1,
    1,
    'Madrid',
    { lat: 40.4168, lng: -3.7038 },
    'Spain',
    'Community of Madrid',
    null,
    null,
    null,
    null,
    null,
    null,
    'image_ready',
    null,
    '/images/2026/02/12/10.jpg',
    '/images/2026/02/12/10_grid.jpg',
    new Date('2026-02-12T00:00:00Z'),
    null,
    new Date('2026-02-12T00:00:00Z')
  );

describe('DeleteAdminRoutePointUseCase', () => {
  const routeRepository = {
    findById: vi.fn(),
  };
  const deleteRoutePointAdminUseCase = {
    execute: vi.fn(),
  };
  const storage = {
    deleteImage: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('deletes route point in a transaction and cleans images after commit', async () => {
    routeRepository.findById.mockResolvedValue(createRoutePoint());
    deleteRoutePointAdminUseCase.execute.mockResolvedValue(undefined);
    storage.deleteImage.mockResolvedValue(undefined);

    const connection = {
      beginTransaction: vi.fn().mockResolvedValue(undefined),
      commit: vi.fn().mockResolvedValue(undefined),
      rollback: vi.fn().mockResolvedValue(undefined),
      release: vi.fn(),
      query: vi.fn(),
    };
    vi.spyOn(pool, 'getConnection').mockResolvedValue(connection as any);

    const useCase = new DeleteAdminRoutePointUseCase(
      routeRepository as any,
      deleteRoutePointAdminUseCase as any,
      storage as any
    );

    await useCase.execute(10);

    expect(routeRepository.findById).toHaveBeenCalledWith(10, connection);
    expect(deleteRoutePointAdminUseCase.execute).toHaveBeenCalledWith(10, { queryExecutor: connection });
    expect(storage.deleteImage).toHaveBeenCalledWith('2026/02/12/10.jpg');
    expect(storage.deleteImage).toHaveBeenCalledWith('2026/02/12/10_hero.jpg');
    expect(storage.deleteImage).toHaveBeenCalledWith('2026/02/12/10_grid.jpg');
    expect(connection.commit).toHaveBeenCalledTimes(1);
    expect(connection.rollback).not.toHaveBeenCalled();
  });

  it('returns not found and rolls back when route point does not exist', async () => {
    routeRepository.findById.mockResolvedValue(null);

    const connection = {
      beginTransaction: vi.fn().mockResolvedValue(undefined),
      commit: vi.fn().mockResolvedValue(undefined),
      rollback: vi.fn().mockResolvedValue(undefined),
      release: vi.fn(),
      query: vi.fn(),
    };
    vi.spyOn(pool, 'getConnection').mockResolvedValue(connection as any);

    const useCase = new DeleteAdminRoutePointUseCase(
      routeRepository as any,
      deleteRoutePointAdminUseCase as any,
      storage as any
    );

    await expect(useCase.execute(10)).rejects.toThrow('RoutePoint 10 not found');

    expect(deleteRoutePointAdminUseCase.execute).not.toHaveBeenCalled();
    expect(connection.commit).not.toHaveBeenCalled();
    expect(connection.rollback).toHaveBeenCalledTimes(1);
  });

  it('keeps successful delete even when file cleanup fails', async () => {
    routeRepository.findById.mockResolvedValue(createRoutePoint());
    deleteRoutePointAdminUseCase.execute.mockResolvedValue(undefined);
    storage.deleteImage
      .mockRejectedValueOnce(new Error('disk issue'))
      .mockResolvedValue(undefined);

    const connection = {
      beginTransaction: vi.fn().mockResolvedValue(undefined),
      commit: vi.fn().mockResolvedValue(undefined),
      rollback: vi.fn().mockResolvedValue(undefined),
      release: vi.fn(),
      query: vi.fn(),
    };
    vi.spyOn(pool, 'getConnection').mockResolvedValue(connection as any);

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const useCase = new DeleteAdminRoutePointUseCase(
      routeRepository as any,
      deleteRoutePointAdminUseCase as any,
      storage as any
    );

    await expect(useCase.execute(10)).resolves.toBeUndefined();

    expect(connection.commit).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledWith(
      'Admin route-point image cleanup failed',
      expect.objectContaining({ routePointId: 10 })
    );
  });
});
