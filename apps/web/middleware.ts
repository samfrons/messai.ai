import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(_req) {
    // Add any custom middleware logic here
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Protect API routes (except auth and health)
        if (req.nextUrl.pathname.startsWith('/api/')) {
          const publicPaths = ['/api/auth', '/api/health'];
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
    '/api/((?!auth|health).*)',
    '/dashboard/:path*',
    '/lab/:path*',
    '/predictions/:path*',
    '/experiments/:path*',
  ],
};
