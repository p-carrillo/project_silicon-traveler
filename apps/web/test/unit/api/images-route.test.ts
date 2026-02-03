import { afterEach, describe, expect, it, vi } from 'vitest';

const originalApiUrl = process.env.API_URL;
const originalNextPublicApiUrl = process.env.NEXT_PUBLIC_API_URL;

afterEach(() => {
  process.env.API_URL = originalApiUrl;
  process.env.NEXT_PUBLIC_API_URL = originalNextPublicApiUrl;
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe('images proxy route', () => {
  it('prefers API_URL when set', async () => {
    process.env.API_URL = 'http://api:3000';
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3010';

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(new Uint8Array([1, 2, 3]), {
        status: 200,
        headers: { 'content-type': 'image/jpeg' },
      })
    );
    vi.stubGlobal('fetch', fetchMock);

    const { GET } = await import('../../../src/app/api/images/[...path]/route');

    await GET(new Request('http://localhost') as any, {
      params: { path: ['2026', '02', '01', 'photo-1-thumb.jpg'] },
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://api:3000/images/2026/02/01/photo-1-thumb.jpg'
    );
  });

  it('falls back to NEXT_PUBLIC_API_URL when API_URL is missing', async () => {
    delete process.env.API_URL;
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3010';

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(new Uint8Array([4, 5, 6]), {
        status: 200,
        headers: { 'content-type': 'image/jpeg' },
      })
    );
    vi.stubGlobal('fetch', fetchMock);

    const { GET } = await import('../../../src/app/api/images/[...path]/route');

    await GET(new Request('http://localhost') as any, {
      params: { path: ['2026', '02', '01', 'photo-2-thumb.jpg'] },
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3010/images/2026/02/01/photo-2-thumb.jpg'
    );
  });

  it('strips images/ prefix when provided', async () => {
    process.env.API_URL = 'http://api:3000';

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(new Uint8Array([7, 8, 9]), {
        status: 200,
        headers: { 'content-type': 'image/jpeg' },
      })
    );
    vi.stubGlobal('fetch', fetchMock);

    const { GET } = await import('../../../src/app/api/images/[...path]/route');

    await GET(new Request('http://localhost') as any, {
      params: { path: ['images', '2026', '02', '01', 'photo-3-thumb.jpg'] },
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://api:3000/images/2026/02/01/photo-3-thumb.jpg'
    );
  });
});
