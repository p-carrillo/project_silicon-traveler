import { afterEach, describe, expect, it, vi } from 'vitest';

const originalApiUrl = process.env.API_URL;
const originalApiKey = process.env.API_KEY;

afterEach(() => {
  process.env.API_URL = originalApiUrl;
  process.env.API_KEY = originalApiKey;
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe('admin geocode proxy route', () => {
  it('proxies query and forwards authorization header', async () => {
    // Arrange
    process.env.API_URL = 'http://api:3000';
    process.env.API_KEY = 'secret-key';

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          coordinates: { lat: 40.4168, lng: -3.7038 },
        }),
        {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }
      )
    );
    vi.stubGlobal('fetch', fetchMock);

    const { GET } = await import('../../../src/app/admin/api/geocode/route');

    // Act
    await GET(
      {
        nextUrl: new URL(
          'http://localhost/admin/api/geocode?place_name=Madrid&country=Spain'
        ),
      } as any
    );

    // Assert
    expect(fetchMock).toHaveBeenCalledWith(
      'http://api:3000/api/admin/geocode?place_name=Madrid&country=Spain',
      {
        method: 'GET',
        headers: expect.any(Headers),
        cache: 'no-store',
      }
    );
    const headers = fetchMock.mock.calls[0][1].headers as Headers;
    expect(headers.get('Authorization')).toBe('Bearer secret-key');
  });

  it('returns 400 when place_name is missing', async () => {
    // Arrange
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const { GET } = await import('../../../src/app/admin/api/geocode/route');

    // Act
    const response = await GET(
      {
        nextUrl: new URL('http://localhost/admin/api/geocode'),
      } as any
    );

    // Assert
    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
