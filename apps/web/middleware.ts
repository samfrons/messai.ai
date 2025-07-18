import { withAuth } from 'next-auth/middleware';
import { NextResponse, NextRequest } from 'next/server';
import { apiSecurityMiddleware } from './src/middleware/api-security';

async function middleware(req: NextRequest) {
  // Apply API security middleware for all API routes
  if (req.nextUrl.pathname.startsWith('/api/')) {
    const securityResponse = await apiSecurityMiddleware(req);

    // If rate limited or security check failed, return early
    if (securityResponse.status !== 200) {
      return securityResponse;
    }

    // For public API paths, continue without auth
    const publicPaths = ['/api/auth', '/api/health', '/api/papers', '/api/research'];
    const isPublicPath = publicPaths.some((path) => req.nextUrl.pathname.startsWith(path));

    if (isPublicPath) {
      return securityResponse;
    }
  }

  // For non-API routes or protected API routes, apply auth
  return NextResponse.next();
}

export default withAuth(
  async function authMiddleware(req) {
    // First apply our custom middleware
    const customResponse = await middleware(req);

    // If custom middleware returned a response (rate limit, etc), use it
    if (customResponse.status !== 200) {
      return customResponse;
    }

    // Otherwise continue with normal flow
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Protect API routes (except public ones)
        if (req.nextUrl.pathname.startsWith('/api/')) {
          const publicPaths = ['/api/auth', '/api/health', '/api/papers', '/api/research'];
          const isPublicPath = publicPaths.some((path) => req.nextUrl.pathname.startsWith(path));

          if (!isPublicPath) {
            return !!token;
          }
        }

        // Protect dashboard routes
        if (req.nextUrl.pathname.startsWith('/dashboard')) {
          return !!token;
        }

        // Protect lab routes
        if (req.nextUrl.pathname.startsWith('/lab')) {
          return !!token;
        }

        // Protect prediction routes
        if (req.nextUrl.pathname.startsWith('/predictions')) {
          return !!token;
        }

        // Protect experiment routes
        if (req.nextUrl.pathname.startsWith('/experiments')) {
          return !!token;
        }

        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    '/api/:path*',
    '/dashboard/:path*',
    '/lab/:path*',
    '/predictions/:path*',
    '/experiments/:path*',
  ],
};
