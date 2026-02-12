import { describe, expect, it, beforeEach, vi } from "vitest";
import { RateLimiter } from "./rate-limiter";

describe("RateLimiter", () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    limiter = new RateLimiter({
      perMinute: 3,
      perHour: 5,
      globalPerHour: 10,
    });
  });

  it("allows requests within per-minute limit", () => {
    expect(limiter.check("1.2.3.4").allowed).toBe(true);
    expect(limiter.check("1.2.3.4").allowed).toBe(true);
    expect(limiter.check("1.2.3.4").allowed).toBe(true);
  });

  it("rejects requests exceeding per-minute limit", () => {
    limiter.check("1.2.3.4");
    limiter.check("1.2.3.4");
    limiter.check("1.2.3.4");
    const result = limiter.check("1.2.3.4");
    expect(result.allowed).toBe(false);
    expect(result.retryAfterSeconds).toBe(60);
  });

  it("rejects requests exceeding per-hour limit", () => {
    // Use separate minutes to avoid per-minute limit
    const now = Date.now();
    vi.spyOn(Date, "now")
      .mockReturnValueOnce(now)
      .mockReturnValueOnce(now)
      .mockReturnValueOnce(now)
      .mockReturnValueOnce(now + 61_000) // next minute
      .mockReturnValueOnce(now + 61_000)
      .mockReturnValueOnce(now + 61_000)
      .mockReturnValueOnce(now + 122_000) // another minute
      .mockReturnValueOnce(now + 122_000);

    // First 3 in minute 1
    limiter.check("1.2.3.4");
    limiter.check("1.2.3.4");
    limiter.check("1.2.3.4");
    // Next 2 in minute 2 (total = 5, at perHour limit)
    limiter.check("1.2.3.4");
    limiter.check("1.2.3.4");
    // 6th request in minute 3 should be rejected (perHour = 5)
    const result = limiter.check("1.2.3.4");
    expect(result.allowed).toBe(false);

    vi.restoreAllMocks();
  });

  it("rejects requests exceeding global limit", () => {
    // 10 requests from 10 different IPs
    for (let i = 0; i < 10; i++) {
      expect(limiter.check(`10.0.0.${i}`).allowed).toBe(true);
    }
    // 11th request from new IP should fail (globalPerHour = 10)
    const result = limiter.check("10.0.0.99");
    expect(result.allowed).toBe(false);
  });

  it("isolates limits between IPs", () => {
    limiter.check("1.1.1.1");
    limiter.check("1.1.1.1");
    limiter.check("1.1.1.1");
    // IP 1 is at per-minute limit
    expect(limiter.check("1.1.1.1").allowed).toBe(false);
    // IP 2 should still be allowed
    expect(limiter.check("2.2.2.2").allowed).toBe(true);
  });

  it("allows requests again after minute window slides", () => {
    const now = Date.now();
    vi.spyOn(Date, "now").mockReturnValue(now);

    limiter.check("1.2.3.4");
    limiter.check("1.2.3.4");
    limiter.check("1.2.3.4");
    expect(limiter.check("1.2.3.4").allowed).toBe(false);

    // Advance past the minute window
    vi.spyOn(Date, "now").mockReturnValue(now + 61_000);
    expect(limiter.check("1.2.3.4").allowed).toBe(true);

    vi.restoreAllMocks();
  });

  it("resets all state", () => {
    limiter.check("1.2.3.4");
    limiter.check("1.2.3.4");
    limiter.check("1.2.3.4");
    expect(limiter.check("1.2.3.4").allowed).toBe(false);

    limiter.reset();
    expect(limiter.check("1.2.3.4").allowed).toBe(true);
  });
});
