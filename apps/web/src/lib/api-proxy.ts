import { NextRequest, NextResponse } from 'next/server';

const INTERNAL_API_URL =
  process.env.API_URL || 'http://api:3000';
const API_KEY = process.env.API_KEY;

/**
 * Proxies an incoming Next.js request to the internal API container.
 *
 * Adds the API key header so browser clients never need to know it,
 * and forwards query string, method, body and content-type.
 */
export async function proxyToApi(
  request: NextRequest,
  pathSegments: string[],
  prefix: string
): Promise<NextResponse> {
  const subPath = pathSegments.join('/');
  const targetPath = subPath ? `/api/${prefix}/${subPath}` : `/api/${prefix}`;
  const targetUrl = new URL(targetPath, INTERNAL_API_URL);

  // Forward query parameters
  request.nextUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.set(key, value);
  });

  const headers: HeadersInit = {};
  if (API_KEY) {
    headers['Authorization'] = `Bearer ${API_KEY}`;
  }

  const contentType = request.headers.get('content-type');
  if (contentType) {
    headers['Content-Type'] = contentType;
  }

  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    headers['Accept-Language'] = acceptLanguage;
  }

  const hasBody = ['POST', 'PUT', 'PATCH'].includes(request.method);

  try {
    const upstream = await fetch(targetUrl.toString(), {
      method: request.method,
      headers,
      body: hasBody ? await request.text() : undefined,
    });

    const responseBody = await upstream.text();

    return new NextResponse(responseBody, {
      status: upstream.status,
      headers: {
        'Content-Type':
          upstream.headers.get('content-type') || 'application/json',
      },
    });
  } catch (error) {
    console.error(`Proxy error [${prefix}/${subPath}]:`, error);
    return NextResponse.json(
      { error: 'Upstream service unavailable' },
      { status: 502 }
    );
  }
}
