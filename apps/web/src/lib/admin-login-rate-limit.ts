const WINDOW_MS = 15 * 60 * 1000;
const BLOCK_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const MAX_STORE_SIZE = 5000;

interface RateLimitEntry {
  attempts: number;
  windowStartedAtMs: number;
  blockedUntilMs: number;
  lastSeenAtMs: number;
}

const attemptStore = new Map<string, RateLimitEntry>();

export function createAdminLoginRateLimitKey(clientIp: string, username: string): string {
  const normalizedIp = normalizeValue(clientIp, 'unknown');
  const normalizedUser = normalizeValue(username, 'unknown').toLowerCase();
  return `${normalizedIp}::${normalizedUser}`;
}

export function isAdminLoginRateLimited(key: string, nowMs: number = Date.now()): boolean {
  const entry = attemptStore.get(key);
  if (!entry) {
    return false;
  }

  if (entry.blockedUntilMs > nowMs) {
    entry.lastSeenAtMs = nowMs;
    return true;
  }

  if (nowMs - entry.windowStartedAtMs > WINDOW_MS) {
    attemptStore.delete(key);
  }

  return false;
}

export function registerFailedAdminLoginAttempt(key: string, nowMs: number = Date.now()): {
  blocked: boolean;
} {
  const existing = attemptStore.get(key);
  const entry =
    existing && nowMs - existing.windowStartedAtMs <= WINDOW_MS
      ? existing
      : {
          attempts: 0,
          windowStartedAtMs: nowMs,
          blockedUntilMs: 0,
          lastSeenAtMs: nowMs,
        };

  entry.lastSeenAtMs = nowMs;

  if (entry.blockedUntilMs > nowMs) {
    attemptStore.set(key, entry);
    return { blocked: true };
  }

  if (nowMs - entry.windowStartedAtMs > WINDOW_MS) {
    entry.attempts = 0;
    entry.windowStartedAtMs = nowMs;
  }

  entry.attempts += 1;

  if (entry.attempts >= MAX_ATTEMPTS) {
    entry.blockedUntilMs = nowMs + BLOCK_MS;
  }

  attemptStore.set(key, entry);
  pruneAttemptStore(nowMs);

  return { blocked: entry.blockedUntilMs > nowMs };
}

export function clearAdminLoginAttempts(key: string): void {
  attemptStore.delete(key);
}

export function resolveClientIpFromHeaders(headerStore: Headers): string {
  const forwarded = headerStore.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) {
      return first;
    }
  }

  const realIp = headerStore.get('x-real-ip');
  if (realIp && realIp.trim().length > 0) {
    return realIp.trim();
  }

  return 'unknown';
}

export function __dangerous__clearAdminLoginRateLimitStore(): void {
  attemptStore.clear();
}

function pruneAttemptStore(nowMs: number): void {
  if (attemptStore.size <= MAX_STORE_SIZE) {
    return;
  }

  for (const [key, value] of attemptStore.entries()) {
    const isExpiredBlock = value.blockedUntilMs <= nowMs;
    const isStaleWindow = nowMs - value.windowStartedAtMs > WINDOW_MS;
    if (isExpiredBlock && isStaleWindow) {
      attemptStore.delete(key);
    }

    if (attemptStore.size <= MAX_STORE_SIZE) {
      return;
    }
  }
}

function normalizeValue(value: string, fallback: string): string {
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : fallback;
}
