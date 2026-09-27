import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE_NAME } from '@/lib/admin-auth';
import { isE2EDevelopmentEnabled } from '@/lib/e2e';

const API_URL = process.env.API_URL || 'http://api:3000';
const API_KEY = process.env.API_KEY;
export const dynamic = 'force-dynamic';

export async function POST(_request: NextRequest, { params }: { params: { command: string } }): Promise<NextResponse> {
  if (!isE2EDevelopmentEnabled()) return new NextResponse('Not Found', { status: 404 });
  const session = cookies().get(ADMIN_SESSION_COOKIE_NAME)?.value;
  if (!session) return new NextResponse('Not Found', { status: 404 });
  const headers = new Headers({ 'x-admin-e2e-session': session });
  if (API_KEY) headers.set('Authorization', `Bearer ${API_KEY}`);
  const upstream = await fetch(new URL(`/api/admin/e2e/runs/${encodeURIComponent(params.command)}/cancel`, API_URL), { method: 'POST', headers, cache: 'no-store' });
  return new NextResponse(upstream.body, { status: upstream.status, headers: { 'Content-Type': upstream.headers.get('content-type') || 'application/json', 'Cache-Control': 'no-store' } });
}
