import { NextResponse, type NextRequest } from 'next/server';
import {
  ADMIN_SESSION_COOKIE_NAME,
  getAdminCredentials,
  getAdminSessionSecret,
  isValidAdminSessionToken,
} from './lib/admin-auth';

export async function middleware(request: NextRequest): Promise<NextResponse> {
  if (!request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  const credentials = getAdminCredentials();
  const sessionSecret = getAdminSessionSecret();
  if (!credentials || !sessionSecret) {
    return new NextResponse('Not Found', { status: 404 });
  }

  if (request.nextUrl.pathname === '/admin/login') {
    return NextResponse.next();
  }

  const sessionToken = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  if (sessionToken) {
    const isValid = await isValidAdminSessionToken(
      sessionToken,
      credentials.user
    );

    if (isValid) {
      return NextResponse.next();
    }
  }

  const loginUrl = new URL('/admin/login', request.url);
  const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  if (nextPath.startsWith('/admin') && nextPath !== '/admin/login') {
    loginUrl.searchParams.set('next', nextPath);
  }
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/admin/:path*'],
};
