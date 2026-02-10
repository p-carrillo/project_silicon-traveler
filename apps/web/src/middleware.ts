import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest): NextResponse {
  if (!request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // In development we keep /admin open for convenience.
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next();
  }

  const user = process.env.ADMIN_BASIC_USER;
  const pass = process.env.ADMIN_BASIC_PASSWORD;
  if (!user || !pass) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const auth = request.headers.get('authorization') || '';
  if (!auth.startsWith('Basic ')) {
    return unauthorized();
  }

  const decoded = safeBase64Decode(auth.slice('Basic '.length));
  if (!decoded) {
    return unauthorized();
  }

  const sepIndex = decoded.indexOf(':');
  if (sepIndex === -1) {
    return unauthorized();
  }

  const providedUser = decoded.slice(0, sepIndex);
  const providedPass = decoded.slice(sepIndex + 1);

  if (providedUser !== user || providedPass !== pass) {
    return unauthorized();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};

function unauthorized(): NextResponse {
  return new NextResponse('Unauthorized', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Admin"',
    },
  });
}

function safeBase64Decode(value: string): string | null {
  try {
    return atob(value);
  } catch {
    return null;
  }
}

