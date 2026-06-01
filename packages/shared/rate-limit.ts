/**
 * Rate limiting implementation using in-memory storage
 * For production, consider using Redis or a dedicated service
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Configuration for rate limiting
 */
export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number; // milliseconds
}

/**
 * Default rate limit configuration
 */
const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: parseInt(import.meta.env.VITE_RATE_LIMIT_MAX_REQUESTS ?? "5", 10),
  windowMs: parseInt(import.meta.env.VITE_RATE_LIMIT_WINDOW_MS ?? "900000", 10), // 15 minutes
};

/**
 * Gets the rate limit key for a request
 * Can be based on IP, user ID, email, etc.
 */
function getRateLimitKey(identifier: string, prefix: string = "rl"): string {
  return `${prefix}:${identifier}`;
}

/**
 * Checks if a request is rate limited
 * Returns true if the request should be allowed, false if it's rate limited
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = DEFAULT_CONFIG,
  prefix: string = "rl",
): boolean {
  const key = getRateLimitKey(identifier, prefix);
  const now = Date.now();

  let entry = rateLimitStore.get(key);

  // If no entry exists or the window has expired, create a new one
  if (!entry || now >= entry.resetTime) {
    entry = {
      count: 1,
      resetTime: now + config.windowMs,
    };
    rateLimitStore.set(key, entry);
    return true; // Allow the request
  }

  // Increment the counter
  entry.count++;

  // Check if the limit has been exceeded
  if (entry.count > config.maxRequests) {
    return false; // Reject the request
  }

  return true; // Allow the request
}

/**
 * Resets the rate limit for an identifier
 */
export function resetRateLimit(identifier: string, prefix: string = "rl"): void {
  const key = getRateLimitKey(identifier, prefix);
  rateLimitStore.delete(key);
}

/**
 * Gets the current rate limit status for debugging
 */
export function getRateLimitStatus(
  identifier: string,
  config: RateLimitConfig = DEFAULT_CONFIG,
  prefix: string = "rl",
): {
  remaining: number;
  resetTime: number;
  isLimited: boolean;
} {
  const key = getRateLimitKey(identifier, prefix);
  const entry = rateLimitStore.get(key);

  if (!entry || Date.now() >= entry.resetTime) {
    return {
      remaining: config.maxRequests,
      resetTime: Date.now() + config.windowMs,
      isLimited: false,
    };
  }

  return {
    remaining: Math.max(0, config.maxRequests - entry.count),
    resetTime: entry.resetTime,
    isLimited: entry.count >= config.maxRequests,
  };
}

/**
 * Cleanup function to remove expired entries
 * Call this periodically (e.g., every 5 minutes) to prevent memory leaks
 */
export function cleanupExpiredRateLimits(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now >= entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Cleanup expired entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(cleanupExpiredRateLimits, 5 * 60 * 1000);
}
