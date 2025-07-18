import { LRUCache } from 'lru-cache';

export interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  max: number; // Maximum number of items
  updateAgeOnGet?: boolean; // Update age on cache hit
}

// Cache configurations for different data types
export const cacheConfigs = {
  // Research papers - cache for 1 hour
  papers: {
    ttl: 60 * 60 * 1000, // 1 hour
    max: 1000,
    updateAgeOnGet: true,
  },
  // Paper details - cache for 2 hours
  paperDetails: {
    ttl: 2 * 60 * 60 * 1000, // 2 hours
    max: 500,
    updateAgeOnGet: true,
  },
  // Search results - cache for 30 minutes
  search: {
    ttl: 30 * 60 * 1000, // 30 minutes
    max: 200,
    updateAgeOnGet: false,
  },
  // Stats and aggregations - cache for 6 hours
  stats: {
    ttl: 6 * 60 * 60 * 1000, // 6 hours
    max: 50,
    updateAgeOnGet: true,
  },
  // User data - cache for 5 minutes
  user: {
    ttl: 5 * 60 * 1000, // 5 minutes
    max: 100,
    updateAgeOnGet: true,
  },
  // Prediction results - cache for 15 minutes
  predictions: {
    ttl: 15 * 60 * 1000, // 15 minutes
    max: 100,
    updateAgeOnGet: false,
  },
} as const;

// Create individual caches for different data types
const caches = new Map<string, LRUCache<string, any>>();

/**
 * Get or create a cache instance
 */
function getCache(namespace: string, config: CacheConfig): LRUCache<string, any> {
  if (!caches.has(namespace)) {
    caches.set(
      namespace,
      new LRUCache({
        max: config.max,
        ttl: config.ttl,
        updateAgeOnGet: config.updateAgeOnGet,
        // Add size calculation for better memory management
        sizeCalculation: (value) => {
          return JSON.stringify(value).length;
        },
        // Set max size to 50MB per cache
        maxSize: 50 * 1024 * 1024,
      })
    );
  }

  return caches.get(namespace)!;
}

/**
 * Cache wrapper for database queries
 */
export async function withCache<T>(
  namespace: keyof typeof cacheConfigs,
  key: string,
  fetcher: () => Promise<T>,
  customConfig?: Partial<CacheConfig>
): Promise<T> {
  const config = { ...cacheConfigs[namespace], ...customConfig };
  const cache = getCache(namespace, config);

  // Check cache first
  const cached = cache.get(key);
  if (cached !== undefined) {
    return cached;
  }

  // Fetch fresh data
  try {
    const fresh = await fetcher();

    // Store in cache
    cache.set(key, fresh);

    return fresh;
  } catch (error) {
    // If there's an error and we have stale data, return it
    const stale = cache.get(key, { allowStale: true });
    if (stale !== undefined) {
      console.warn(`Returning stale data for ${namespace}:${key} due to error:`, error);
      return stale;
    }

    // Otherwise, re-throw the error
    throw error;
  }
}

/**
 * Invalidate cache entries
 */
export function invalidateCache(namespace?: keyof typeof cacheConfigs, key?: string) {
  if (!namespace) {
    // Clear all caches
    caches.clear();
    return;
  }

  const cache = caches.get(namespace);
  if (!cache) return;

  if (!key) {
    // Clear entire namespace
    cache.clear();
  } else {
    // Clear specific key
    cache.delete(key);
  }
}

/**
 * Generate cache key from query parameters
 */
export function generateCacheKey(params: Record<string, any>): string {
  // Sort keys for consistent cache keys
  const sortedKeys = Object.keys(params).sort();
  const keyParts = sortedKeys
    .filter((key) => params[key] !== undefined && params[key] !== null)
    .map((key) => `${key}:${JSON.stringify(params[key])}`);

  return keyParts.join('|');
}

/**
 * Cache stats for monitoring
 */
export function getCacheStats() {
  const stats: Record<string, any> = {};

  caches.forEach((cache, namespace) => {
    stats[namespace] = {
      size: cache.size,
      calculatedSize: cache.calculatedSize,
      hits: (cache as any).hits || 0,
      misses: (cache as any).misses || 0,
      hitRate: (cache as any).hits / ((cache as any).hits + (cache as any).misses) || 0,
    };
  });

  return stats;
}

/**
 * Decorator for caching class methods
 */
export function Cacheable(
  namespace: keyof typeof cacheConfigs,
  keyGenerator?: (args: any[]) => string
) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const key = keyGenerator ? keyGenerator(args) : `${propertyKey}:${JSON.stringify(args)}`;

      return withCache(namespace, key, () => originalMethod.apply(this, args));
    };

    return descriptor;
  };
}

/**
 * Batch cache operations for better performance
 */
export class CacheBatcher<T> {
  private batch: Map<string, Promise<T>> = new Map();
  private timer: NodeJS.Timeout | null = null;

  constructor(
    private namespace: keyof typeof cacheConfigs,
    private fetcher: (keys: string[]) => Promise<Map<string, T>>,
    private batchDelay: number = 10 // ms
  ) {}

  async get(key: string): Promise<T | undefined> {
    const cache = getCache(this.namespace, cacheConfigs[this.namespace]);

    // Check cache first
    const cached = cache.get(key);
    if (cached !== undefined) {
      return cached;
    }

    // Check if already in batch
    if (this.batch.has(key)) {
      return this.batch.get(key);
    }

    // Add to batch
    const promise = this.scheduleBatch(key);
    this.batch.set(key, promise);

    return promise;
  }

  private scheduleBatch(key: string): Promise<T> {
    return new Promise((resolve, reject) => {
      if (this.timer) {
        clearTimeout(this.timer);
      }

      this.timer = setTimeout(async () => {
        const keys = Array.from(this.batch.keys());
        this.batch.clear();
        this.timer = null;

        try {
          const results = await this.fetcher(keys);
          const cache = getCache(this.namespace, cacheConfigs[this.namespace]);

          // Cache all results
          results.forEach((value, k) => {
            cache.set(k, value);
          });

          // Resolve promise for this key
          const result = results.get(key);
          if (result !== undefined) {
            resolve(result);
          } else {
            reject(new Error(`No result for key: ${key}`));
          }
        } catch (error) {
          reject(error);
        }
      }, this.batchDelay);
    });
  }
}
