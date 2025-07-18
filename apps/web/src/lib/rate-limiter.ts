import { NextRequest } from 'next/server';
import { LRUCache } from 'lru-cache';

export interface RateLimitConfig {
  interval: number; // Time window in ms
  uniqueTokenPerInterval: number; // Max number of requests per interval
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

// Default rate limit configurations
export const rateLimitConfigs = {
  // API rate limits
  api: {
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 60, // 60 requests per minute
  },
  // Auth endpoints have stricter limits
  auth: {
    interval: 15 * 60 * 1000, // 15 minutes
    uniqueTokenPerInterval: 5, // 5 attempts per 15 minutes
  },
  // Search endpoints
  search: {
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 30, // 30 searches per minute
  },
  // Write operations
  write: {
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 10, // 10 writes per minute
  },
} as const;

// Create a cache for rate limiting
const rateLimitCache = new LRUCache<string, number[]>({
  max: 10000, // Maximum number of items in cache
  ttl: 1000 * 60 * 15, // 15 minutes TTL
});

/**
 * Get client identifier from request
 */
function getClientId(request: NextRequest): string {
  // Try to get IP from various headers
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwardedFor?.split(',')[0] || realIp || 'anonymous';

  // For authenticated requests, you might want to use user ID instead
  // const userId = request.headers.get('x-user-id');
  // if (userId) return `user:${userId}`;

  return `ip:${ip}`;
}

/**
 * Check if request should be rate limited
 */
export async function rateLimit(
  request: NextRequest,
  config: RateLimitConfig = rateLimitConfigs.api
): Promise<RateLimitResult> {
  const clientId = getClientId(request);
  const now = Date.now();
  const windowStart = now - config.interval;

  // Get existing requests for this client
  const requests = rateLimitCache.get(clientId) || [];

  // Filter out requests outside the current window
  const requestsInWindow = requests.filter((timestamp) => timestamp > windowStart);

  // Check if limit exceeded
  if (requestsInWindow.length >= config.uniqueTokenPerInterval) {
    return {
      success: false,
      limit: config.uniqueTokenPerInterval,
      remaining: 0,
      reset: windowStart + config.interval,
    };
  }

  // Add current request
  requestsInWindow.push(now);
  rateLimitCache.set(clientId, requestsInWindow);

  return {
    success: true,
    limit: config.uniqueTokenPerInterval,
    remaining: config.uniqueTokenPerInterval - requestsInWindow.length,
    reset: windowStart + config.interval,
  };
}

/**
 * Middleware helper for rate limiting
 */
export function withRateLimit(config: RateLimitConfig = rateLimitConfigs.api) {
  return async (request: NextRequest) => {
    const result = await rateLimit(request, config);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: 'Too many requests',
          message: `Rate limit exceeded. Please try again after ${new Date(
            result.reset
          ).toISOString()}`,
          retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': result.limit.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': result.reset.toString(),
            'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    return null; // Continue with request
  };
}
