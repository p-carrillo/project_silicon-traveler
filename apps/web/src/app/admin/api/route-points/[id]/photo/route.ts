import { NextRequest, NextResponse } from 'next/server';

const INTERNAL_API_URL = process.env.API_URL || 'http://api:3000';
const API_KEY = process.env.API_KEY;
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png']);

function buildEditPageUrl(id: number, errorCode?: string): URL {
  const url = new URL(`/admin/route-points/${id}`, 'http://localhost');
  if (errorCode) {
    url.searchParams.set('error', errorCode);
  }
  return url;
}

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
): Promise<NextResponse> {
  const id = Number.parseInt(context.params.id, 10);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: 'Invalid route point ID' }, { status: 400 });
  }

  const formData = await request.formData();
  const file = formData.get('photo');
  if (!(file instanceof File)) {
    return NextResponse.redirect(buildEditPageUrl(id, 'photo_required'), { status: 303 });
  }
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return NextResponse.redirect(buildEditPageUrl(id, 'photo_type'), { status: 303 });
  }

  const imageBuffer = await file.arrayBuffer();
  if (imageBuffer.byteLength === 0) {
    return NextResponse.redirect(buildEditPageUrl(id, 'photo_required'), { status: 303 });
  }

  const headers = new Headers({
    'Content-Type': file.type === 'image/png' ? 'image/png' : 'image/jpeg',
  });
  if (API_KEY) {
    headers.set('Authorization', `Bearer ${API_KEY}`);
  }

  try {
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
      return NextResponse.redirect(buildEditPageUrl(id, 'photo_failed'), { status: 303 });
    }
  } catch (error) {
    console.error('Admin upload photo proxy error:', error);
    return NextResponse.redirect(buildEditPageUrl(id, 'photo_failed'), { status: 303 });
  }

  return NextResponse.redirect(buildEditPageUrl(id), { status: 303 });
}
