import type { NextRequest } from 'next/server';
import { afterEach, describe, expect, it } from 'vitest';
import { createAdminSessionToken, ADMIN_SESSION_COOKIE_NAME } from '../../../src/lib/admin-auth';
import { middleware } from '../../../src/middleware';

const originalNodeEnv = process.env.NODE_ENV;
const originalAdminBasicUser = process.env.ADMIN_BASIC_USER;
const originalAdminBasicPassword = process.env.ADMIN_BASIC_PASSWORD;

afterEach(() => {
  process.env.NODE_ENV = originalNodeEnv;
  process.env.ADMIN_BASIC_USER = originalAdminBasicUser;
  process.env.ADMIN_BASIC_PASSWORD = originalAdminBasicPassword;
});

describe('admin middleware auth', () => {
  it('allows non-admin routes without auth', async () => {
    // Arrange
    const request = createRequest('/archive');

    // Act
    const response = await middleware(request);

    // Assert
    expect(response.headers.get('x-middleware-next')).toBe('1');
  });

  it('allows /admin/login without session cookie', async () => {
    // Arrange
    process.env.NODE_ENV = 'development';
    process.env.ADMIN_BASIC_USER = 'admin';
    process.env.ADMIN_BASIC_PASSWORD = 'secret';
    const request = createRequest('/admin/login');

    // Act
    const response = await middleware(request);

    // Assert
    expect(response.headers.get('x-middleware-next')).toBe('1');
  });

  it('redirects admin route to login when there is no session', async () => {
    // Arrange
    process.env.NODE_ENV = 'development';
    process.env.ADMIN_BASIC_USER = 'admin';
    process.env.ADMIN_BASIC_PASSWORD = 'secret';
    const request = createRequest('/admin?status=published');

    // Act
    const response = await middleware(request);

    // Assert
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toContain('/admin/login?next=');
  });

  it('returns 404 when admin credentials are missing', async () => {
    // Arrange
    process.env.NODE_ENV = 'development';
    delete process.env.ADMIN_BASIC_USER;
    delete process.env.ADMIN_BASIC_PASSWORD;
    const request = createRequest('/admin');

    // Act
    const response = await middleware(request);

    // Assert
    expect(response.status).toBe(404);
  });

  it('allows admin route with valid session cookie', async () => {
    // Arrange
    process.env.NODE_ENV = 'development';
    process.env.ADMIN_BASIC_USER = 'admin';
    process.env.ADMIN_BASIC_PASSWORD = 'secret';
    const token = await createAdminSessionToken('admin', 'secret');
    const request = createRequest('/admin', {
      [ADMIN_SESSION_COOKIE_NAME]: token,
    });

    // Act
    const response = await middleware(request);

    // Assert
    expect(response.headers.get('x-middleware-next')).toBe('1');
  });

  it('redirects when session cookie is invalid', async () => {
    // Arrange
    process.env.NODE_ENV = 'development';
    process.env.ADMIN_BASIC_USER = 'admin';
    process.env.ADMIN_BASIC_PASSWORD = 'secret';
    const request = createRequest('/admin', {
      [ADMIN_SESSION_COOKIE_NAME]: 'invalid.token',
    });

    // Act
    const response = await middleware(request);

    // Assert
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toContain('/admin/login?next=');
  });
});

function createRequest(
  pathWithQuery: string,
  cookiesMap?: Record<string, string>
): NextRequest {
  const url = new URL(pathWithQuery, 'http://localhost');
  const cookieValues = new Map<string, string>(Object.entries(cookiesMap ?? {}));

  return {
    url: url.toString(),
    nextUrl: {
      pathname: url.pathname,
      search: url.search,
    },
    cookies: {
      get(name: string) {
        const value = cookieValues.get(name);
        if (!value) return undefined;
        return { name, value };
      },
    },
  } as unknown as NextRequest;
}
