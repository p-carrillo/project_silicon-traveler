import { afterEach, describe, expect, it, vi } from 'vitest';

const originalApiUrl = process.env.API_URL;
const originalNextPublicApiUrl = process.env.NEXT_PUBLIC_API_URL;

afterEach(() => {
  process.env.API_URL = originalApiUrl;
  process.env.NEXT_PUBLIC_API_URL = originalNextPublicApiUrl;
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe('getPhotos', () => {
  it('appends the search query when provided', async () => {
    process.env.API_URL = 'http://api:3000';
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3010';

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          photos: [],
          pagination: { limit: 8, offset: 0, count: 0 },
        }),
        {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }
      )
    );
    vi.stubGlobal('fetch', fetchMock);

    const { getPhotos } = await import('../../../src/lib/api');

    await getPhotos(8, 0, '  Coast  ');

    const requestUrl = fetchMock.mock.calls[0][0] as string;
    expect(requestUrl).toContain('limit=8');
    expect(requestUrl).toContain('offset=0');
    expect(requestUrl).toContain('q=Coast');
  });

  it('omits the search query when empty', async () => {
    process.env.API_URL = 'http://api:3000';
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3010';

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          photos: [],
          pagination: { limit: 8, offset: 0, count: 0 },
        }),
        {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }
      )
    );
    vi.stubGlobal('fetch', fetchMock);

    const { getPhotos } = await import('../../../src/lib/api');

    await getPhotos(8, 0, '   ');

    const requestUrl = fetchMock.mock.calls[0][0] as string;
    expect(requestUrl).toContain('limit=8');
    expect(requestUrl).toContain('offset=0');
    expect(requestUrl).not.toContain('q=');
  });

  it('appends the date range when provided', async () => {
    process.env.API_URL = 'http://api:3000';
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3010';

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          photos: [],
          pagination: { limit: 8, offset: 0, count: 0 },
        }),
        {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }
      )
    );
    vi.stubGlobal('fetch', fetchMock);

    const { getPhotos } = await import('../../../src/lib/api');

    await getPhotos(8, 0, '', {
      startDate: '2026-02-01',
      endDate: '2026-02-03',
    });

    const requestUrl = fetchMock.mock.calls[0][0] as string;
    expect(requestUrl).toContain('start_date=2026-02-01');
    expect(requestUrl).toContain('end_date=2026-02-03');
  });
});

describe('getRoutePoints', () => {
  it('returns route points including travel_mode when provided by API', async () => {
    process.env.API_URL = 'http://api:3000';
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3010';

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          route_points: [
            {
              id: 1,
              journey_id: 1,
              sequence: 10,
              longitude: 2,
              latitude: 1,
              distance_km: 25,
              city_name: 'Lisbon',
              country_name: 'Portugal',
              travel_mode: 'air',
              status: 'pending',
              created_at: '2026-02-14T00:00:00.000Z',
              updated_at: '2026-02-14T00:00:00.000Z',
            },
          ],
          pagination: { limit: 100, offset: 0, count: 1 },
        }),
        {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }
      )
    );
    vi.stubGlobal('fetch', fetchMock);

    const { getRoutePoints } = await import('../../../src/lib/api');
    const result = await getRoutePoints();

    expect(result.route_points[0].travel_mode).toBe('air');
  });
});
