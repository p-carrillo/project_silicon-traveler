import { afterEach, describe, expect, it, vi } from 'vitest';

const originalApiUrl = process.env.API_URL;
const originalApiKey = process.env.API_KEY;

afterEach(() => {
  process.env.API_URL = originalApiUrl;
  process.env.API_KEY = originalApiKey;
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe('admin upload photo proxy route', () => {
  function buildRequest(url: string, formData: FormData | (() => Promise<FormData>)) {
    return {
      nextUrl: new URL(url),
      formData:
        typeof formData === 'function'
          ? formData
          : async () => formData,
    } as any;
  }

  it('proxies image upload to internal API and redirects back', async () => {
    // Arrange
    process.env.API_URL = 'http://api:3000';
    process.env.API_KEY = 'secret-key';

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    );
    vi.stubGlobal('fetch', fetchMock);

    const { POST } = await import(
      '../../../src/app/admin/api/route-points/[id]/photo/route'
    );

    const formData = new FormData();
    formData.append('photo', new File([new Uint8Array([1, 2, 3])], 'photo.jpg', { type: 'image/jpeg' }));

    // Act
    const response = await POST(
      buildRequest('https://traveler.example/admin/api/route-points/7/photo', formData),
      { params: { id: '7' } }
    );

    // Assert
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      new URL('http://api:3000/api/admin/route-points/7/photo'),
      expect.objectContaining({
        method: 'PUT',
        body: expect.any(ArrayBuffer),
        cache: 'no-store',
        headers: expect.any(Headers),
      })
    );
    const headers = fetchMock.mock.calls[0][1].headers as Headers;
    expect(headers.get('Authorization')).toBe('Bearer secret-key');
    expect(headers.get('Content-Type')).toBe('image/jpeg');
    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe('/admin/route-points/7');
  });

  it('redirects with photo_required when file is missing', async () => {
    // Arrange
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const { POST } = await import(
      '../../../src/app/admin/api/route-points/[id]/photo/route'
    );

    // Act
    const response = await POST(
      buildRequest('https://traveler.example/admin/api/route-points/5/photo', new FormData()),
      { params: { id: '5' } }
    );

    // Assert
    expect(fetchMock).not.toHaveBeenCalled();
    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe(
      '/admin/route-points/5?error=photo_required'
    );
  });

  it('redirects with photo_type when mime type is invalid', async () => {
    // Arrange
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const { POST } = await import(
      '../../../src/app/admin/api/route-points/[id]/photo/route'
    );

    const formData = new FormData();
    formData.append('photo', new File([new Uint8Array([1, 2])], 'photo.gif', { type: 'image/gif' }));

    // Act
    const response = await POST(
      buildRequest('https://traveler.example/admin/api/route-points/8/photo', formData),
      { params: { id: '8' } }
    );

    // Assert
    expect(fetchMock).not.toHaveBeenCalled();
    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe(
      '/admin/route-points/8?error=photo_type'
    );
  });

  it('redirects with photo_failed when form parsing throws', async () => {
    // Arrange
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const { POST } = await import(
      '../../../src/app/admin/api/route-points/[id]/photo/route'
    );

    // Act
    const response = await POST(
      buildRequest('https://traveler.example/admin/api/route-points/9/photo', async () => {
        throw new Error('body too large');
      }),
      { params: { id: '9' } }
    );

    // Assert
    expect(fetchMock).not.toHaveBeenCalled();
    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe(
      '/admin/route-points/9?error=photo_failed'
    );
  });
});
