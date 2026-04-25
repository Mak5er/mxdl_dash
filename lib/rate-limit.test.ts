import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  checkRateLimit,
  clearRateLimitBuckets,
  getClientIp,
} from "@/lib/rate-limit";

describe("rate limiter", () => {
  beforeEach(() => {
    clearRateLimitBuckets();
  });

  afterEach(() => {
    delete process.env.RATE_LIMIT_MAX_BUCKETS;
  });

  it("allows requests under the cap", () => {
    expect(checkRateLimit("a", { windowSeconds: 60, maxRequests: 2 }).allowed).toBe(
      true,
    );
    expect(checkRateLimit("a", { windowSeconds: 60, maxRequests: 2 }).allowed).toBe(
      true,
    );
  });

  it("blocks requests over the cap", () => {
    checkRateLimit("a", { windowSeconds: 60, maxRequests: 1 });
    expect(checkRateLimit("a", { windowSeconds: 60, maxRequests: 1 }).allowed).toBe(
      false,
    );
  });

  it("bounds bucket growth", () => {
    process.env.RATE_LIMIT_MAX_BUCKETS = "2";

    expect(checkRateLimit("a", { windowSeconds: 60, maxRequests: 1 }).allowed).toBe(
      true,
    );
    expect(checkRateLimit("b", { windowSeconds: 60, maxRequests: 1 }).allowed).toBe(
      true,
    );
    expect(checkRateLimit("c", { windowSeconds: 60, maxRequests: 1 }).allowed).toBe(
      true,
    );
    expect(checkRateLimit("a", { windowSeconds: 60, maxRequests: 1 }).allowed).toBe(
      true,
    );
  });

  it("prefers Cloudflare client IP over spoofable forwarded headers", () => {
    const request = new Request("https://example.test", {
      headers: {
        "cf-connecting-ip": "203.0.113.7",
        "x-forwarded-for": "198.51.100.9, 198.51.100.10",
      },
    });

    expect(getClientIp(request)).toBe("203.0.113.7");
  });
});
