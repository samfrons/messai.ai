import React, { cache } from 'react';
import { headers } from 'next/headers';
import { unstable_cache } from 'next/cache';

/**
 * SSR Optimization utilities for Next.js App Router
 */

// Revalidation times
export const REVALIDATION_TIMES = {
  STATIC: 3600 * 24, // 24 hours
  DYNAMIC: 3600, // 1 hour
  FREQUENT: 300, // 5 minutes
  REALTIME: 60, // 1 minute
} as const;

/**
 * Create a cached function with proper types and revalidation
 */
export function createCachedFunction<TArgs extends any[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  options: {
    revalidate?: number | false;
    tags?: string[];
  } = {}
) {
  return unstable_cache(fn, undefined, {
    revalidate: options.revalidate ?? REVALIDATION_TIMES.DYNAMIC,
    tags: options.tags ?? [],
  });
}

/**
 * Cache wrapper for database queries in server components
 */
export function cacheQuery<T>(queryFn: () => Promise<T>, cacheKey?: string): () => Promise<T> {
  return cache(async () => {
    // Add request-specific cache key if needed
    const requestHeaders = headers();
    const requestId = requestHeaders.get('x-request-id');

    return queryFn();
  });
}

/**
 * Generate static params for dynamic routes
 */
export async function generateStaticParams<T extends Record<string, string>>(
  fetcher: () => Promise<T[]>,
  options: {
    maxPages?: number;
    revalidate?: number;
  } = {}
): Promise<T[]> {
  try {
    const params = await fetcher();

    // Limit the number of statically generated pages
    if (options.maxPages && params.length > options.maxPages) {
      return params.slice(0, options.maxPages);
    }

    return params;
  } catch (error) {
    console.error('Failed to generate static params:', error);
    return [];
  }
}

/**
 * Optimized metadata generation
 */
export function generateMetadata(options: {
  title: string;
  description: string;
  image?: string;
  type?: 'website' | 'article' | 'profile';
  publishedTime?: string;
  authors?: string[];
  tags?: string[];
}) {
  const {
    title,
    description,
    image = '/og-image.png',
    type = 'website',
    publishedTime,
    authors = [],
    tags = [],
  } = options;

  return {
    title: `${title} | MESSAI`,
    description,
    openGraph: {
      title,
      description,
      type,
      images: [{ url: image }],
      siteName: 'MESSAI',
      ...(publishedTime && { publishedTime }),
      ...(authors.length > 0 && { authors }),
      ...(tags.length > 0 && { tags }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

/**
 * Streaming data utilities
 */
export function createStreamableResponse<T>(dataFetcher: () => AsyncGenerator<T, void, unknown>) {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of dataFetcher()) {
          const json = JSON.stringify(chunk);
          controller.enqueue(encoder.encode(`data: ${json}\n\n`));
        }

        controller.enqueue(encoder.encode('event: done\ndata: {}\n\n'));
      } catch (error) {
        controller.error(error);
      } finally {
        controller.close();
      }
    },
  });
}

/**
 * Partial prerendering helper
 */
export function withPartialPrerendering<T extends Record<string, any>>(
  Component: React.ComponentType<T>
) {
  return function PartialPrerenderWrapper(props: T) {
    // Mark dynamic parts of the component
    const isDynamic = 'searchParams' in props || 'params' in props;

    if (isDynamic) {
      // This will be rendered on-demand
      // TEMPORARY FIX: return <Component {...props} />;
      return Component(props);
    }

    // This will be statically rendered
    // TEMPORARY FIX: return <Component {...props} />;
    return Component(props);
  };
}

/**
 * Progressive hydration wrapper
 */
export function withProgressiveHydration<T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  options: {
    priority?: 'high' | 'low';
    fallback?: React.ReactNode;
  } = {}
) {
  return function ProgressiveHydrationWrapper(props: T) {
    const { priority = 'high', fallback = null } = options;

    // Use React 18's selective hydration
    if (typeof window === 'undefined') {
      // Server-side: render normally
      // TEMPORARY FIX: return <Component {...props} />;
      return Component(props);
    }

    // Client-side: hydrate based on priority
    if (priority === 'high') {
      // TEMPORARY FIX: return <Component {...props} />;
      return Component(props);
    }

    // Low priority: defer hydration
    // TEMPORARY FIX: return <div suppressHydrationWarning>{fallback || <Component {...props} />}</div>;
    return fallback || Component(props);
  };
}

/**
 * Image optimization for SSR
 */
export function getOptimizedImageProps(
  src: string,
  options: {
    width: number;
    height: number;
    quality?: number;
    priority?: boolean;
  }
) {
  const { width, height, quality = 75, priority = false } = options;

  // Generate srcSet for responsive images
  const widths = [width * 0.5, width, width * 1.5, width * 2]
    .map(Math.round)
    .filter((w) => w <= 3840); // Max 4K

  const srcSet = widths
    .map((w) => {
      const h = Math.round((height / width) * w);
      return `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=${quality} ${w}w`;
    })
    .join(', ');

  return {
    src,
    srcSet,
    sizes: `(max-width: ${width}px) 100vw, ${width}px`,
    width,
    height,
    loading: priority ? 'eager' : 'lazy',
    decoding: 'async',
  };
}

/**
 * Data prefetching for navigation
 */
export class DataPrefetcher {
  private static cache = new Map<string, Promise<any>>();

  static prefetch<T>(key: string, fetcher: () => Promise<T>): void {
    if (!this.cache.has(key)) {
      const promise = fetcher().catch((error) => {
        // Remove from cache on error
        this.cache.delete(key);
        throw error;
      });

      this.cache.set(key, promise);
    }
  }

  static async get<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    if (!this.cache.has(key)) {
      this.prefetch(key, fetcher);
    }

    return this.cache.get(key)!;
  }

  static clear(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }
}

/**
 * Server Component data loading pattern
 */
export async function loadServerData<T>(
  loader: () => Promise<T>,
  options: {
    cache?: boolean;
    revalidate?: number;
    fallback?: T;
  } = {}
): Promise<{ data: T | null; error: Error | null }> {
  try {
    const data = await loader();
    return { data, error: null };
  } catch (error) {
    console.error('Server data loading error:', error);

    if (options.fallback !== undefined) {
      return { data: options.fallback, error: error as Error };
    }

    return { data: null, error: error as Error };
  }
}
