import "server-only";

type CacheEntry<T> = {
  expiresAt: number;
  value?: T;
  promise?: Promise<T>;
};

const cache = new Map<string, CacheEntry<unknown>>();

export async function ttlCache<T>(
  key: string,
  ttlSeconds: number,
  loader: () => Promise<T>,
) {
  const now = Date.now();
  const existing = cache.get(key) as CacheEntry<T> | undefined;

  if (existing?.value !== undefined && existing.expiresAt > now) {
    return existing.value;
  }

  if (existing?.promise && existing.expiresAt > now) {
    return existing.promise;
  }

  const promise = loader()
    .then((value) => {
      cache.set(key, {
        expiresAt: Date.now() + ttlSeconds * 1000,
        value,
      });
      return value;
    })
    .catch((error) => {
      cache.delete(key);
      throw error;
    });

  cache.set(key, {
    expiresAt: now + ttlSeconds * 1000,
    promise,
  });

  return promise;
}

export function getEnvTtl(name: string, fallback: number) {
  const raw = process.env[name];
  const parsed = raw ? Number(raw) : fallback;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function clearTtlCache() {
  cache.clear();
}

