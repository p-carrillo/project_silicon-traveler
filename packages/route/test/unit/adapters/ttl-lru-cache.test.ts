import { describe, expect, it, vi } from 'vitest';
import { TtlLruCache } from '../../../src/adapters/ttl-lru-cache';

describe('TtlLruCache', () => {
  it('returns cached values before ttl expiry', () => {
    const cache = new TtlLruCache<string, number>(10);

    cache.set('a', 1, 1000);

    expect(cache.get('a')).toBe(1);
    expect(cache.has('a')).toBe(true);
  });

  it('expires values after ttl', () => {
    vi.useFakeTimers();
    const cache = new TtlLruCache<string, number>(10);

    cache.set('a', 1, 1000);
    vi.advanceTimersByTime(1001);

    expect(cache.get('a')).toBeUndefined();
    expect(cache.has('a')).toBe(false);
    vi.useRealTimers();
  });

  it('evicts least-recently-used entries when max size is exceeded', () => {
    const cache = new TtlLruCache<string, number>(2);

    cache.set('a', 1, 1000);
    cache.set('b', 2, 1000);
    expect(cache.get('a')).toBe(1); // bump a as MRU

    cache.set('c', 3, 1000);

    expect(cache.get('b')).toBeUndefined();
    expect(cache.get('a')).toBe(1);
    expect(cache.get('c')).toBe(3);
  });
});
