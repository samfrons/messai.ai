import { NextRequest, NextResponse } from 'next/server';
import { LRUCache } from 'lru-cache';

export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  keyGenerator?: (request: NextRequest) => string;
}

// Default rate limit configurations for different tiers
export const RATE_LIMIT_TIERS = {
  anonymous: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
  },
  authenticated: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000,
    message: 'Rate limit exceeded, please try again later.',
  },
  premium: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10000,
    message: 'Rate limit exceeded for premium tier.',
  },
};

// In-memory store for rate limiting (consider Redis for production)
const rateLimitStore = new LRUCache<string, { count: number; resetTime: number }>({
  max: 10000, // Maximum number of items
  ttl: 60 * 60 * 1000, // 1 hour TTL
});

/**
 * Generate a unique key for rate limiting
 */
function generateKey(request: NextRequest): string {
  // Try to get user ID from various sources
  const userId = request.headers.get('x-user-id');
  const apiKey = request.headers.get('x-api-key');

  if (userId) return `user:${userId}`;
  if (apiKey) return `api:${apiKey}`;

  // Fallback to IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
  return `ip:${ip}`;
}

/**
 * Get rate limit tier based on authentication status
 */
async function getRateLimitTier(request: NextRequest): Promise<keyof typeof RATE_LIMIT_TIERS> {
  const apiKey = request.headers.get('x-api-key');
  const authHeader = request.headers.get('authorization');

  // Check for API key or authentication
  if (apiKey) {
    // In production, validate API key and check tier
    // For now, assume authenticated
    return 'authenticated';
  }

  if (authHeader) {
    // In production, validate JWT token
    return 'authenticated';
  }

  return 'anonymous';
}

/**
 * Rate limiting middleware
 */
export async function rateLimitMiddleware(request: NextRequest): Promise<NextResponse | null> {
  // Skip rate limiting for certain paths
  const skipPaths = ['/api/health', '/api/auth'];
  if (skipPaths.some((path) => request.nextUrl.pathname.startsWith(path))) {
    return null;
  }

  const key = generateKey(request);
  const tier = await getRateLimitTier(request);
  const config = RATE_LIMIT_TIERS[tier];

  const now = Date.now();
  const stored = rateLimitStore.get(key);

  if (!stored || now > stored.resetTime) {
    // New window
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return null;
  }

  // Increment counter
  stored.count += 1;

  if (stored.count > config.max) {
    // Rate limit exceeded
    const retryAfter = Math.ceil((stored.resetTime - now) / 1000);

    return new NextResponse(
      JSON.stringify({
        error: 'Rate limit exceeded',
        message: config.message,
        retryAfter,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': config.max.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(stored.resetTime).toISOString(),
          'Retry-After': retryAfter.toString(),
        },
      }
    );
  }

  // Update store
  rateLimitStore.set(key, stored);

  // Add rate limit headers to response
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', config.max.toString());
  response.headers.set('X-RateLimit-Remaining', (config.max - stored.count).toString());
  response.headers.set('X-RateLimit-Reset', new Date(stored.resetTime).toISOString());

  return null;
}

/**
 * Rate limit info endpoint handler
 */
export async function getRateLimitInfo(request: NextRequest): Promise<Response> {
  const key = generateKey(request);
  const tier = await getRateLimitTier(request);
  const config = RATE_LIMIT_TIERS[tier];
  const stored = rateLimitStore.get(key);

  const now = Date.now();
  const count = stored && now <= stored.resetTime ? stored.count : 0;
  const resetTime = stored?.resetTime || now + config.windowMs;

  return NextResponse.json({
    tier,
    limit: config.max,
    used: count,
    remaining: Math.max(0, config.max - count),
    resetTime: new Date(resetTime).toISOString(),
    windowMs: config.windowMs,
  });
}
