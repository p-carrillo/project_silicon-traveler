import { NextRequest, NextResponse } from 'next/server';

const INTERNAL_API_URL = process.env.API_URL || 'http://api:3000';
const API_KEY = process.env.API_KEY;
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png']);

function redirectToEditPage(id: number, errorCode?: string): NextResponse {
  const location = errorCode
    ? `/admin/route-points/${id}?error=${encodeURIComponent(errorCode)}`
    : `/admin/route-points/${id}`;
  return new NextResponse(null, {
    status: 303,
    headers: { Location: location },
  });
}

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const id = Number.parseInt(context.params.id, 10);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: 'Invalid route point ID' }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get('photo');

    if (!(file instanceof File)) {
      return redirectToEditPage(id, 'photo_required');
    }
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return redirectToEditPage(id, 'photo_type');
    }

    const imageBuffer = await file.arrayBuffer();
    if (imageBuffer.byteLength === 0) {
      return redirectToEditPage(id, 'photo_required');
    }

    const headers = new Headers({
      'Content-Type': file.type === 'image/png' ? 'image/png' : 'image/jpeg',
    });
    if (API_KEY) {
      headers.set('Authorization', `Bearer ${API_KEY}`);
    }

    const upstream = await fetch(
      new URL(`/api/admin/route-points/${id}/photo`, INTERNAL_API_URL),
      {
        method: 'PUT',
        headers,
        body: imageBuffer,
        cache: 'no-store',
      }
    );

    if (!upstream.ok) {
      const responseBody = await upstream.text();
      console.error('Admin upload photo proxy upstream error:', {
        status: upstream.status,
        body: responseBody.slice(0, 512),
      });
      return redirectToEditPage(id, 'photo_failed');
    }

    return redirectToEditPage(id);
  } catch (error: unknown) {
    console.error('Admin upload photo proxy error:', error);
    const id = Number.parseInt(context.params.id, 10);
    if (Number.isFinite(id)) {
      return redirectToEditPage(id, 'photo_failed');
    }
    return NextResponse.json({ error: 'Failed to upload route point photo' }, { status: 500 });
  }
}
