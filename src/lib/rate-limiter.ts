import type { NextRequest } from "next/server";

interface RateLimitConfig {
  perMinute: number;
  perHour: number;
  globalPerHour: number;
}

interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  perMinute: parseInt(process.env.STT_RATE_LIMIT_PER_MINUTE ?? "10", 10),
  perHour: parseInt(process.env.STT_RATE_LIMIT_PER_HOUR ?? "50", 10),
  globalPerHour: parseInt(
    process.env.STT_GLOBAL_RATE_LIMIT_PER_HOUR ?? "500",
    10
  ),
};

const ONE_MINUTE_MS = 60_000;
const ONE_HOUR_MS = 3_600_000;
const CLEANUP_INTERVAL_MS = 5 * 60_000; // 5 minutes

export class RateLimiter {
  private timestamps = new Map<string, number[]>();
  private globalTimestamps: number[] = [];
  private config: RateLimitConfig;
  private lastCleanup = Date.now();

  constructor(config: Partial<RateLimitConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  check(ip: string): RateLimitResult {
    const now = Date.now();
    this.maybeCleanup(now);

    // Global limit
    this.globalTimestamps = this.globalTimestamps.filter(
      (t) => now - t < ONE_HOUR_MS
    );
    if (this.globalTimestamps.length >= this.config.globalPerHour) {
      return { allowed: false, retryAfterSeconds: 60 };
    }

    // Per-IP limits
    const timestamps = this.timestamps.get(ip) ?? [];
    const recentMinute = timestamps.filter((t) => now - t < ONE_MINUTE_MS);
    const recentHour = timestamps.filter((t) => now - t < ONE_HOUR_MS);

    if (recentMinute.length >= this.config.perMinute) {
      return { allowed: false, retryAfterSeconds: 60 };
    }

    if (recentHour.length >= this.config.perHour) {
      return { allowed: false, retryAfterSeconds: 60 };
    }

    // Record this request
    recentHour.push(now);
    this.timestamps.set(ip, recentHour);
    this.globalTimestamps.push(now);

    return { allowed: true };
  }

  private maybeCleanup(now: number) {
    if (now - this.lastCleanup < CLEANUP_INTERVAL_MS) return;
    this.lastCleanup = now;

    for (const [ip, timestamps] of this.timestamps) {
      const recent = timestamps.filter((t) => now - t < ONE_HOUR_MS);
      if (recent.length === 0) {
        this.timestamps.delete(ip);
      } else {
        this.timestamps.set(ip, recent);
      }
    }

    this.globalTimestamps = this.globalTimestamps.filter(
      (t) => now - t < ONE_HOUR_MS
    );
  }

  /** Reset all state (for testing). */
  reset() {
    this.timestamps.clear();
    this.globalTimestamps = [];
  }
}

/** Singleton rate limiter instance. */
let instance: RateLimiter | null = null;

export function getRateLimiter(): RateLimiter {
  if (!instance) {
    instance = new RateLimiter();
  }
  return instance;
}

/** Extract client IP from request headers. */
export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}
