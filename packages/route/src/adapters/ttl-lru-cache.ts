interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class TtlLruCache<K, V> {
  private readonly maxEntries: number;
  private readonly store = new Map<K, CacheEntry<V>>();

  constructor(maxEntries: number) {
    this.maxEntries = Math.max(1, maxEntries);
  }

  get(key: K): V | undefined {
    const entry = this.store.get(key);
    if (!entry) {
      return undefined;
    }

    if (Date.now() >= entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }

    // LRU bump: reinsert to the map tail
    this.store.delete(key);
    this.store.set(key, entry);
    return entry.value;
  }

  has(key: K): boolean {
    return this.get(key) !== undefined;
  }

  set(key: K, value: V, ttlMs: number): void {
    const safeTtlMs = Math.max(1, ttlMs);
    const entry: CacheEntry<V> = {
      value,
      expiresAt: Date.now() + safeTtlMs,
    };

    if (this.store.has(key)) {
      this.store.delete(key);
    }

    this.store.set(key, entry);
    this.evictOverflow();
  }

  clear(): void {
    this.store.clear();
  }

  size(): number {
    return this.store.size;
  }

  private evictOverflow(): void {
    while (this.store.size > this.maxEntries) {
      const firstKey = this.store.keys().next().value;
      if (firstKey === undefined) {
        return;
      }
      this.store.delete(firstKey);
    }
  }
}
