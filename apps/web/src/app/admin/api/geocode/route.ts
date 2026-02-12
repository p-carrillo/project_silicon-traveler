import { NextRequest, NextResponse } from 'next/server';

const INTERNAL_API_URL = process.env.API_URL || 'http://api:3000';
const API_KEY = process.env.API_KEY;

export async function GET(request: NextRequest): Promise<NextResponse> {
  const placeName = request.nextUrl.searchParams.get('place_name')?.trim();
  if (!placeName) {
    return NextResponse.json({ error: 'place_name is required' }, { status: 400 });
  }

  const targetUrl = new URL('/api/admin/geocode', INTERNAL_API_URL);
  targetUrl.searchParams.set('place_name', placeName);

  const country = request.nextUrl.searchParams.get('country')?.trim();
  if (country) {
    targetUrl.searchParams.set('country', country);
  }

  const region = request.nextUrl.searchParams.get('region')?.trim();
  if (region) {
    targetUrl.searchParams.set('region', region);
  }

  const headers = new Headers();
  if (API_KEY) {
    headers.set('Authorization', `Bearer ${API_KEY}`);
  }

  try {
    const upstream = await fetch(targetUrl.toString(), {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    const responseBody = await upstream.text();
    return new NextResponse(responseBody, {
      status: upstream.status,
      headers: {
        'Content-Type': upstream.headers.get('content-type') || 'application/json',
      },
    });
  } catch (error) {
    console.error('Admin geocode proxy error:', error);
    return NextResponse.json({ error: 'Upstream service unavailable' }, { status: 502 });
  }
}
