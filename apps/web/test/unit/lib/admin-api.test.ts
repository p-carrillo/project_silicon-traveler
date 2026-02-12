import { afterEach, describe, expect, it, vi } from 'vitest';

const originalApiUrl = process.env.API_URL;
const originalApiKey = process.env.API_KEY;

afterEach(() => {
  process.env.API_URL = originalApiUrl;
  process.env.API_KEY = originalApiKey;
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe('deleteAdminRoutePoint', () => {
  it('calls admin delete endpoint', async () => {
    process.env.API_URL = 'http://api:3000';
    process.env.API_KEY = 'secret-key';

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(null, { status: 204 })
    );
    vi.stubGlobal('fetch', fetchMock);

    const { deleteAdminRoutePoint } = await import('../../../src/lib/admin-api');

    await deleteAdminRoutePoint(77);

    expect(fetchMock).toHaveBeenCalledWith(
      'http://api:3000/api/admin/route-points/77',
      expect.objectContaining({
        method: 'DELETE',
        cache: 'no-store',
      })
    );

    const headers = fetchMock.mock.calls[0][1].headers as Headers;
    expect(headers.get('Authorization')).toBe('Bearer secret-key');
  });

  it('throws when delete fails', async () => {
    process.env.API_URL = 'http://api:3000';

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: 'failed' }), { status: 500 })
    );
    vi.stubGlobal('fetch', fetchMock);

    const { deleteAdminRoutePoint } = await import('../../../src/lib/admin-api');

    await expect(deleteAdminRoutePoint(9)).rejects.toThrow('Failed to delete route point');
  });
});
