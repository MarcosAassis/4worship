interface CacheEntry<T> {
  expiresAt: number;
  value: T;
}

export class MemoryCache {
  private store = new Map<string, CacheEntry<unknown>>();

  constructor(
    private ttlMs = 10 * 60 * 1000,
    private maxEntries = 100,
  ) {}

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value as T;
  }

  set<T>(key: string, value: T): void {
    if (this.store.size >= this.maxEntries) {
      const oldest = this.store.keys().next().value;
      if (oldest) this.store.delete(oldest);
    }
    this.store.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }
}
