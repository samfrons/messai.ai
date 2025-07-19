import { NextRequest, NextResponse } from 'next/server';

export interface ApiVersionConfig {
  defaultVersion: string;
  supportedVersions: string[];
  deprecatedVersions?: string[];
}

export const API_VERSION_CONFIG: ApiVersionConfig = {
  defaultVersion: 'v1',
  supportedVersions: ['v1', 'v2'],
  deprecatedVersions: [],
};

/**
 * Extract API version from request
 * Priority: URL path > Header > Query param > Default
 */
export function extractApiVersion(request: NextRequest): string {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Check URL path versioning (e.g., /api/v1/papers)
  const pathMatch = pathname.match(/\/api\/(v\d+)\//);
  if (pathMatch) {
    return pathMatch[1];
  }

  // Check header versioning
  const headerVersion = request.headers.get('X-API-Version');
  if (headerVersion && API_VERSION_CONFIG.supportedVersions.includes(headerVersion)) {
    return headerVersion;
  }

  // Check query param versioning
  const queryVersion = url.searchParams.get('version');
  if (queryVersion && API_VERSION_CONFIG.supportedVersions.includes(queryVersion)) {
    return queryVersion;
  }

  return API_VERSION_CONFIG.defaultVersion;
}

/**
 * API Version middleware
 */
export function apiVersionMiddleware(request: NextRequest) {
  const version = extractApiVersion(request);

  // Check if version is supported
  if (!API_VERSION_CONFIG.supportedVersions.includes(version)) {
    return NextResponse.json(
      {
        error: 'Unsupported API version',
        message: `Version ${version} is not supported. Supported versions: ${API_VERSION_CONFIG.supportedVersions.join(
          ', '
        )}`,
      },
      { status: 400 }
    );
  }

  // Add deprecation warning for deprecated versions
  if (API_VERSION_CONFIG.deprecatedVersions?.includes(version)) {
    const response = NextResponse.next();
    response.headers.set(
      'X-API-Deprecation',
      `Version ${version} is deprecated. Please upgrade to ${API_VERSION_CONFIG.defaultVersion}.`
    );
    response.headers.set('Sunset', new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toUTCString()); // 90 days from now
    return response;
  }

  // Add version to response headers
  const response = NextResponse.next();
  response.headers.set('X-API-Version', version);

  return response;
}

/**
 * Helper to create versioned API route handlers
 */
export function createVersionedHandler<T extends Record<string, any>>(
  handlers: Record<string, T>
): (request: NextRequest, context?: any) => Promise<Response> {
  return async (request: NextRequest, context?: any) => {
    const version = extractApiVersion(request);
    const handler = handlers[version] || handlers[API_VERSION_CONFIG.defaultVersion];

    if (!handler) {
      return NextResponse.json(
        {
          error: 'Version handler not found',
          message: `No handler implemented for version ${version}`,
        },
        { status: 501 }
      );
    }

    return handler(request, context);
  };
}
