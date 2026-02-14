import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RoutingAdapter } from '../../../src/adapters/routing.adapter';

vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
  },
}));

import axios from 'axios';

describe('RoutingAdapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('caches successful route responses', async () => {
    const mockedAxios = axios as unknown as { get: ReturnType<typeof vi.fn> };
    mockedAxios.get.mockResolvedValue({
      data: {
        code: 'Ok',
        routes: [
          {
            distance: 1000,
            geometry: {
              coordinates: [
                [-8.3186, 43.3328],
                [-8.2, 43.35],
              ],
            },
          },
        ],
      },
    });

    const adapter = new RoutingAdapter({
      timeoutMs: 1000,
      maxAttempts: 1,
      cacheMaxEntries: 10,
      cacheTtlRouteMs: 10000,
    });

    const first = await adapter.getRoute({ lat: 43.3328, lng: -8.3186 }, { lat: 43.35, lng: -8.2 });
    const second = await adapter.getRoute({ lat: 43.3328, lng: -8.3186 }, { lat: 43.35, lng: -8.2 });

    expect(first?.distanceKm).toBe(1);
    expect(second?.distanceKm).toBe(1);
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
  });

  it('returns null when provider reports no route', async () => {
    const mockedAxios = axios as unknown as { get: ReturnType<typeof vi.fn> };
    mockedAxios.get.mockResolvedValue({
      data: {
        code: 'NoRoute',
        routes: [],
      },
    });

    const adapter = new RoutingAdapter({
      timeoutMs: 1000,
      maxAttempts: 1,
      cacheMaxEntries: 10,
    });

    const route = await adapter.getRoute({ lat: 43.3328, lng: -8.3186 }, { lat: 0, lng: 0 });

    expect(route).toBeNull();
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
  });

  it('returns degraded null and opens circuit on repeated provider failures', async () => {
    const mockedAxios = axios as unknown as { get: ReturnType<typeof vi.fn> };
    mockedAxios.get.mockRejectedValue({
      response: { status: 503 },
      message: 'Service Unavailable',
    });

    const adapter = new RoutingAdapter({
      timeoutMs: 1000,
      maxAttempts: 1,
      circuitFailureThreshold: 1,
      circuitOpenMs: 30000,
      cacheMaxEntries: 10,
    });

    const first = await adapter.getRoute({ lat: 43.3328, lng: -8.3186 }, { lat: 43.35, lng: -8.2 });
    const second = await adapter.getRoute({ lat: 43.3328, lng: -8.3186 }, { lat: 43.35, lng: -8.2 });

    expect(first).toBeNull();
    expect(second).toBeNull();
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
  });
});
