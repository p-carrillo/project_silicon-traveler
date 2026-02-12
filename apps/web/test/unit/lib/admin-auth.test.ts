import { describe, expect, it } from 'vitest';
import {
  createAdminSessionCookie,
  createAdminSessionToken,
  isValidAdminSessionToken,
} from '../../../src/lib/admin-auth';

describe('admin-auth', () => {
  it('creates tokens that validate for the same user and secret', async () => {
    // Arrange
    const token = await createAdminSessionToken('admin', 'secret');

    // Act
    const isValid = await isValidAdminSessionToken(token, 'admin', 'secret');

    // Assert
    expect(isValid).toBe(true);
  });

  it('rejects tokens for another signing secret', async () => {
    // Arrange
    const token = await createAdminSessionToken('admin', 'secret');

    // Act
    const isValid = await isValidAdminSessionToken(token, 'admin', 'different-secret');

    // Assert
    expect(isValid).toBe(false);
  });

  it('rejects expired tokens', async () => {
    // Arrange
    const nowMs = Date.now();
    const token = await createAdminSessionToken('admin', 'secret', {
      nowMs,
      ttlSeconds: 1,
    });

    // Act
    const isValid = await isValidAdminSessionToken(token, 'admin', 'secret', nowMs + 10_000);

    // Assert
    expect(isValid).toBe(false);
  });

  it('builds logout cookie with immediate expiration', () => {
    // Arrange
    const cookie = createAdminSessionCookie('', {
      nodeEnv: 'development',
      maxAge: 0,
    });

    // Assert
    expect(cookie.name).toBe('admin_session');
    expect(cookie.path).toBe('/admin');
    expect(cookie.maxAge).toBe(0);
    expect(cookie.httpOnly).toBe(true);
    expect(cookie.sameSite).toBe('lax');
    expect(cookie.secure).toBe(false);
  });
});
