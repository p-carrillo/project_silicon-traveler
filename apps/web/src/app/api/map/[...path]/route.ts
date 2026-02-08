import { NextRequest, NextResponse } from 'next/server';
import { proxyToApi } from '@/lib/api-proxy';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
): Promise<NextResponse> {
  return proxyToApi(request, params.path, 'map');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
): Promise<NextResponse> {
  return proxyToApi(request, params.path, 'map');
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
): Promise<NextResponse> {
  return proxyToApi(request, params.path, 'map');
}
