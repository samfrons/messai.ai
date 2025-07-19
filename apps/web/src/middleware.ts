import { NextRequest, NextResponse } from 'next/server';
import { apiVersionMiddleware } from './middleware/api-version';
import { rateLimitMiddleware } from './middleware/rate-limit';

export async function middleware(request: NextRequest) {
  // Apply API versioning for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Skip versioning for certain routes
    const skipVersioning = ['/api/auth', '/api/health', '/api/api-docs', '/api/openapi.json'];

    const shouldSkip = skipVersioning.some((path) => request.nextUrl.pathname.startsWith(path));

    if (!shouldSkip) {
      const versionResponse = apiVersionMiddleware(request);
      if (versionResponse.status !== 200) {
        return versionResponse;
      }
    }

    // Apply rate limiting
    const rateLimitResponse = await rateLimitMiddleware(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
