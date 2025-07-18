import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, rateLimitConfigs } from '../lib/rate-limiter';

// CORS configuration
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400',
};

// Security headers
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

/**
 * API Security Middleware
 * Handles CORS, rate limiting, and security headers
 */
export async function apiSecurityMiddleware(request: NextRequest) {
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  // Determine rate limit config based on endpoint
  let rateLimitConfig = rateLimitConfigs.api;
  const pathname = request.nextUrl.pathname;

  if (pathname.includes('/api/auth')) {
    rateLimitConfig = rateLimitConfigs.auth;
  } else if (pathname.includes('/api/papers') && request.method === 'GET') {
    rateLimitConfig = rateLimitConfigs.search;
  } else if (['POST', 'PUT', 'DELETE'].includes(request.method)) {
    rateLimitConfig = rateLimitConfigs.write;
  }

  // Apply rate limiting
  const rateLimitResult = await rateLimit(request, rateLimitConfig);

  if (!rateLimitResult.success) {
    return new NextResponse(
      JSON.stringify({
        error: 'Too many requests',
        message: `Rate limit exceeded. Please try again after ${new Date(
          rateLimitResult.reset
        ).toISOString()}`,
        retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000),
      }),
      {
        status: 429,
        headers: {
          ...corsHeaders,
          ...securityHeaders,
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.reset.toString(),
          'Retry-After': Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  // Add security headers to response
  const response = NextResponse.next();

  // Add CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Add security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Add rate limit headers
  response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString());
  response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
  response.headers.set('X-RateLimit-Reset', rateLimitResult.reset.toString());

  return response;
}

/**
 * API Key validation for sensitive endpoints
 */
export function validateApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-api-key');

  if (!apiKey) {
    return false;
  }

  // In production, compare against hashed API keys stored in database
  const validApiKey = process.env.API_KEY;

  return apiKey === validApiKey;
}

/**
 * IP Whitelist validation for admin endpoints
 */
export function validateIpWhitelist(request: NextRequest): boolean {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const clientIp = forwardedFor?.split(',')[0] || realIp || '';

  const whitelist = process.env.IP_WHITELIST?.split(',') || [];

  if (whitelist.length === 0) {
    // No whitelist configured, allow all
    return true;
  }

  return whitelist.includes(clientIp);
}
