import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OverpassAdapter } from '../../../src/adapters/overpass.adapter';

vi.mock('axios', () => ({
  default: {
    post: vi.fn(),
  },
}));

import axios from 'axios';

describe('OverpassAdapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('caches nearest-city results', async () => {
    const mockedAxios = axios as unknown as { post: ReturnType<typeof vi.fn> };
    mockedAxios.post.mockResolvedValue({
      data: {
        elements: [
          {
            lat: 43.3,
            lon: -8.3,
            tags: {
              name: 'Oleiros',
              place: 'town',
            },
          },
        ],
      },
    });

    const adapter = new OverpassAdapter({
      timeoutMs: 1000,
      maxAttempts: 1,
      cacheMaxEntries: 10,
      cacheTtlCityMs: 10000,
    });

    const first = await adapter.findNearestCity({ lat: 43.3328, lng: -8.3186 }, 10);
    const second = await adapter.findNearestCity({ lat: 43.3328, lng: -8.3186 }, 10);

    expect(first?.name).toBe('Oleiros');
    expect(second?.name).toBe('Oleiros');
    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
  });

  it('returns fallback false and opens circuit for repeated isWater failures', async () => {
    const mockedAxios = axios as unknown as { post: ReturnType<typeof vi.fn> };
    mockedAxios.post.mockRejectedValue({
      response: { status: 504 },
      message: 'Gateway Timeout',
    });

    const adapter = new OverpassAdapter({
      timeoutMs: 1000,
      maxAttempts: 1,
      circuitFailureThreshold: 1,
      circuitOpenMs: 30000,
      cacheMaxEntries: 10,
    });

    const first = await adapter.isWater({ lat: 43.3328, lng: -8.3186 });
    const second = await adapter.isWater({ lat: 43.3328, lng: -8.3186 });

    expect(first).toBe(false);
    expect(second).toBe(false);
    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
  });

  it('caches water detections', async () => {
    const mockedAxios = axios as unknown as { post: ReturnType<typeof vi.fn> };
    mockedAxios.post.mockResolvedValue({
      data: {
        elements: [{}],
      },
    });

    const adapter = new OverpassAdapter({
      timeoutMs: 1000,
      maxAttempts: 1,
      cacheMaxEntries: 10,
      cacheTtlWaterMs: 10000,
    });

    const first = await adapter.isWater({ lat: 1, lng: 1 });
    const second = await adapter.isWater({ lat: 1, lng: 1 });

    expect(first).toBe(true);
    expect(second).toBe(true);
    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
  });
});
