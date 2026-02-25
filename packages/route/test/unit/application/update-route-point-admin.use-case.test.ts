import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateRoutePointAdminUseCase } from '../../../src/application/update-route-point-admin.use-case';
import { RoutePoint } from '../../../src/domain/route-point.entity';

const createRoutePoint = () =>
  new RoutePoint(
    10,
    1,
    1,
    'Old City',
    { lat: 1, lng: 2 },
    'Old Country',
    'Old Region',
    null,
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

describe('UpdateRoutePointAdminUseCase', () => {
  const routeRepository = {
    findById: vi.fn(),
    update: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates provided fields and persists', async () => {
    const routePoint = createRoutePoint();
    routeRepository.findById.mockResolvedValue(routePoint);

    const useCase = new UpdateRoutePointAdminUseCase(routeRepository as any);

    const updated = await useCase.execute({
      id: 10,
      placeName: 'New City',
      coordinates: { lat: 9, lng: 8 },
      imagePrompt: 'New prompt',
      narrativePrompt: 'New text',
    });

    expect(updated.placeName).toBe('New City');
    expect(updated.coordinates).toEqual({ lat: 9, lng: 8 });
    expect(updated.imagePrompt).toBe('New prompt');
    expect(updated.narrativePrompt).toBe('New text');
    expect(routeRepository.update).toHaveBeenCalledWith(routePoint, undefined);
  });

  it('throws when route point is missing', async () => {
    routeRepository.findById.mockResolvedValue(null);
    const useCase = new UpdateRoutePointAdminUseCase(routeRepository as any);

    await expect(useCase.execute({ id: 123, placeName: 'X' })).rejects.toThrow(
      'RoutePoint 123 not found'
    );
    expect(routeRepository.update).not.toHaveBeenCalled();
  });

  it('sets publishedAt when status changes to published', async () => {
    const routePoint = createRoutePoint();
    routeRepository.findById.mockResolvedValue(routePoint);

    const useCase = new UpdateRoutePointAdminUseCase(routeRepository as any);
    const updated = await useCase.execute({ id: 10, status: 'published' });

    expect(updated.status).toBe('published');
    expect(updated.publishedAt).toBeInstanceOf(Date);
  });

  it('clears publishedAt when status changes from published to non-published', async () => {
    const routePoint = createRoutePoint();
    routePoint.status = 'published';
    routePoint.publishedAt = new Date('2026-02-12T00:00:00Z');
    routeRepository.findById.mockResolvedValue(routePoint);

    const useCase = new UpdateRoutePointAdminUseCase(routeRepository as any);
    const updated = await useCase.execute({ id: 10, status: 'image_ready' });

    expect(updated.status).toBe('image_ready');
    expect(updated.publishedAt).toBeNull();
  });
});
