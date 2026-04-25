export type RateLimitOptions = {
  windowSeconds?: number;
  maxRequests?: number;
};

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();
let checksSincePrune = 0;

function readPositiveInteger(name: string, fallback: number) {
  const parsed = Number(process.env[name] ?? fallback);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

function defaultWindowSeconds() {
  return readPositiveInteger("RATE_LIMIT_WINDOW_SECONDS", 60);
}

function defaultMaxRequests() {
  return readPositiveInteger("RATE_LIMIT_MAX_REQUESTS", 60);
}

function maxBuckets() {
  return readPositiveInteger("RATE_LIMIT_MAX_BUCKETS", 5000);
}

function pruneBuckets(now: number) {
  checksSincePrune += 1;

  if (checksSincePrune < 100 && buckets.size <= maxBuckets()) {
    return;
  }

  checksSincePrune = 0;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }

  const overflow = buckets.size - maxBuckets();
  if (overflow <= 0) {
    return;
  }

  for (const key of buckets.keys()) {
    buckets.delete(key);
    if (buckets.size <= maxBuckets()) {
      break;
    }
  }
}

export function checkRateLimit(key: string, options: RateLimitOptions = {}) {
  const now = Date.now();
  pruneBuckets(now);

  const windowMs = (options.windowSeconds ?? defaultWindowSeconds()) * 1000;
  const maxRequests = options.maxRequests ?? defaultMaxRequests();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return {
      allowed: true,
      remaining: Math.max(0, maxRequests - 1),
      retryAfter: 0,
      resetAt: now + windowMs,
    };
  }

  if (existing.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.ceil((existing.resetAt - now) / 1000),
      resetAt: existing.resetAt,
    };
  }

  existing.count += 1;
  buckets.set(key, existing);

  return {
    allowed: true,
    remaining: Math.max(0, maxRequests - existing.count),
    retryAfter: 0,
    resetAt: existing.resetAt,
  };
}

function firstIp(value: string | null) {
  return value?.split(",")[0]?.trim() || null;
}

export function getClientIp(request: Request) {
  return (
    firstIp(request.headers.get("cf-connecting-ip")) ??
    firstIp(request.headers.get("x-real-ip")) ??
    firstIp(request.headers.get("x-forwarded-for")) ??
    "unknown"
  );
}

export function clearRateLimitBuckets() {
  buckets.clear();
}
