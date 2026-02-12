import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DeleteRoutePointAdminUseCase } from '../../../src/application/delete-route-point-admin.use-case';

describe('DeleteRoutePointAdminUseCase', () => {
  const routeRepository = {
    deleteById: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deletes route point when it exists', async () => {
    routeRepository.deleteById.mockResolvedValue(true);

    const useCase = new DeleteRoutePointAdminUseCase(routeRepository as any);
    await useCase.execute(10);

    expect(routeRepository.deleteById).toHaveBeenCalledWith(10, undefined);
  });

  it('throws when route point does not exist', async () => {
    routeRepository.deleteById.mockResolvedValue(false);

    const useCase = new DeleteRoutePointAdminUseCase(routeRepository as any);

    await expect(useCase.execute(123)).rejects.toThrow('RoutePoint 123 not found');
    expect(routeRepository.deleteById).toHaveBeenCalledWith(123, undefined);
  });
});
