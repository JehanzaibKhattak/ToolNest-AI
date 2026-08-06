type WindowState = { count: number; resetAt: number };
const windows = new Map<string, WindowState>();
export function consumeRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now(),
) {
  const current = windows.get(key);
  if (!current || current.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }
  if (current.count >= limit)
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  current.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}
export function clearRateLimitsForTests() {
  windows.clear();
}
