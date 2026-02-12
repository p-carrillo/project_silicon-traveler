import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  createAdminSessionCookie,
  createAdminSessionToken,
  getAdminSessionSecret,
  isValidAdminSessionToken,
} from '../../../src/lib/admin-auth';

const originalSessionSecret = process.env.ADMIN_SESSION_SECRET;

describe('admin-auth', () => {
  beforeEach(() => {
    process.env.ADMIN_SESSION_SECRET = 'session-secret';
  });

  afterEach(() => {
    process.env.ADMIN_SESSION_SECRET = originalSessionSecret;
  });

  it('creates tokens that validate for the same user and configured session secret', async () => {
    const token = await createAdminSessionToken('admin');
    const isValid = await isValidAdminSessionToken(token, 'admin');
    expect(isValid).toBe(true);
  });

  it('rejects tokens after secret rotation', async () => {
    const token = await createAdminSessionToken('admin');
    process.env.ADMIN_SESSION_SECRET = 'rotated-secret';

    const isValid = await isValidAdminSessionToken(token, 'admin');
    expect(isValid).toBe(false);
  });

  it('rejects expired tokens', async () => {
    const nowMs = Date.now();
    const token = await createAdminSessionToken('admin', {
      nowMs,
      ttlSeconds: 1,
    });

    const isValid = await isValidAdminSessionToken(token, 'admin', nowMs + 10_000);
    expect(isValid).toBe(false);
  });

  it('returns null when ADMIN_SESSION_SECRET is missing', () => {
    delete process.env.ADMIN_SESSION_SECRET;
    expect(getAdminSessionSecret()).toBeNull();
  });

  it('throws when trying to create tokens without ADMIN_SESSION_SECRET', async () => {
    delete process.env.ADMIN_SESSION_SECRET;
    await expect(createAdminSessionToken('admin')).rejects.toThrow('Missing required ADMIN_SESSION_SECRET');
  });

  it('builds logout cookie with immediate expiration', () => {
    const cookie = createAdminSessionCookie('', {
      nodeEnv: 'development',
      maxAge: 0,
    });

    expect(cookie.name).toBe('admin_session');
    expect(cookie.path).toBe('/admin');
    expect(cookie.maxAge).toBe(0);
    expect(cookie.httpOnly).toBe(true);
    expect(cookie.sameSite).toBe('lax');
    expect(cookie.secure).toBe(false);
  });
});
