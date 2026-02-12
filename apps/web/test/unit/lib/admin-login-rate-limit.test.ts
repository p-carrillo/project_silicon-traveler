import { afterEach, describe, expect, it } from 'vitest';
import {
  __dangerous__clearAdminLoginRateLimitStore,
  clearAdminLoginAttempts,
  createAdminLoginRateLimitKey,
  isAdminLoginRateLimited,
  registerFailedAdminLoginAttempt,
  resolveClientIpFromHeaders,
} from '../../../src/lib/admin-login-rate-limit';

afterEach(() => {
  __dangerous__clearAdminLoginRateLimitStore();
});

describe('admin-login-rate-limit', () => {
  it('blocks after five failed attempts in the configured window', () => {
    const key = createAdminLoginRateLimitKey('203.0.113.10', 'admin');
    const now = Date.now();

    for (let i = 0; i < 4; i += 1) {
      const status = registerFailedAdminLoginAttempt(key, now + i * 1000);
      expect(status.blocked).toBe(false);
    }

    const status = registerFailedAdminLoginAttempt(key, now + 5000);
    expect(status.blocked).toBe(true);
    expect(isAdminLoginRateLimited(key, now + 6000)).toBe(true);
  });

  it('unblocks after the block duration elapses', () => {
    const key = createAdminLoginRateLimitKey('203.0.113.10', 'admin');
    const now = Date.now();

    for (let i = 0; i < 5; i += 1) {
      registerFailedAdminLoginAttempt(key, now + i * 1000);
    }

    expect(isAdminLoginRateLimited(key, now + 60_000)).toBe(true);
    expect(isAdminLoginRateLimited(key, now + 16 * 60 * 1000)).toBe(false);
  });

  it('clears counters after successful login', () => {
    const key = createAdminLoginRateLimitKey('203.0.113.10', 'admin');
    registerFailedAdminLoginAttempt(key);
    clearAdminLoginAttempts(key);
    expect(isAdminLoginRateLimited(key)).toBe(false);
  });

  it('resolves client IP from forwarded headers', () => {
    const headers = new Headers({
      'x-forwarded-for': '198.51.100.1, 198.51.100.2',
      'x-real-ip': '192.0.2.5',
    });

    expect(resolveClientIpFromHeaders(headers)).toBe('198.51.100.1');
  });

  it('falls back to x-real-ip or unknown', () => {
    expect(resolveClientIpFromHeaders(new Headers({ 'x-real-ip': '192.0.2.20' }))).toBe('192.0.2.20');
    expect(resolveClientIpFromHeaders(new Headers())).toBe('unknown');
  });
});
