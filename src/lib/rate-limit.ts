/**
 * In-memory rate limiter keyed by Clerk userId + route bucket.
 * Limits reset every 60 seconds per key.
 *
 * Buckets:
 *   "standard"  — 20 req/min  (profile, daily-practice stats, lookup-word, etc.)
 *   "generator" — 10 req/min  (generate-question, generate-vocabulary, grammar-lesson, etc.)
 *   "expensive" —  5 req/min  (chat, evaluate — large Groq calls)
 *
 * Note: In-memory, so limits are per server instance. For multi-instance deployments,
 * replace with Redis (e.g. Upstash) for shared state.
 */

export type RateLimitBucket = "standard" | "generator" | "expensive";

const LIMITS: Record<RateLimitBucket, number> = {
  standard:  20,
  generator: 10,
  expensive:  5,
};

const WINDOW_MS = 60_000; // 1 minute

interface Entry {
  count: number;
  windowStart: number;
}

const store = new Map<string, Entry>();

// Prune expired entries periodically (every ~100 calls) to prevent unbounded growth
let callsSinceCleanup = 0;
function maybePrune() {
  if (++callsSinceCleanup < 100) return;
  callsSinceCleanup = 0;
  const now = Date.now();
  store.forEach((entry, key) => {
    if (now - entry.windowStart >= WINDOW_MS) store.delete(key);
  });
}

export function rateLimit(
  userId: string,
  bucket: RateLimitBucket
): { allowed: boolean; retryAfter?: number } {
  maybePrune();

  const key = `${userId}:${bucket}`;
  const now = Date.now();
  const limit = LIMITS[bucket];

  const entry = store.get(key);

  if (!entry || now - entry.windowStart >= WINDOW_MS) {
    store.set(key, { count: 1, windowStart: now });
    return { allowed: true };
  }

  if (entry.count >= limit) {
    const retryAfter = Math.ceil((WINDOW_MS - (now - entry.windowStart)) / 1000);
    return { allowed: false, retryAfter };
  }

  entry.count++;
  return { allowed: true };
}

/** Returns a 429 Response with Retry-After header. */
export function rateLimitResponse(retryAfter: number): Response {
  return new Response("Too many requests. Please try again later.", {
    status: 429,
    headers: {
      "Retry-After": String(retryAfter),
      "Content-Type": "text/plain",
    },
  });
}
