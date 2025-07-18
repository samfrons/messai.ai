import { Prisma } from '@prisma/client';

/**
 * Database query optimization utilities
 */

// Connection pool configuration for production
export const connectionPoolConfig = {
  // Maximum number of connections in the pool
  connectionLimit: process.env.DATABASE_CONNECTION_LIMIT
    ? parseInt(process.env.DATABASE_CONNECTION_LIMIT, 10)
    : 10,

  // Connection timeout in milliseconds
  connectTimeout: 5000,

  // Pool timeout in milliseconds
  pool_timeout: 10,

  // Idle timeout in milliseconds
  idleTimeoutMillis: 10000,

  // Queue limit
  queueLimit: 0,
};

// Query optimization helpers
export const queryOptimizations = {
  /**
   * Select only required fields to reduce data transfer
   */
  paperListSelect: {
    id: true,
    title: true,
    authors: true,
    abstract: true,
    publicationDate: true,
    journal: true,
    doi: true,
    externalUrl: true,
    systemType: true,
    powerOutput: true,
    efficiency: true,
    aiConfidence: true,
    isPublic: true,
    createdAt: true,
  } as const,

  /**
   * Optimized paper detail select
   */
  paperDetailSelect: {
    ...queryOptimizations.paperListSelect,
    aiSummary: true,
    aiKeyFindings: true,
    aiMethodology: true,
    anodeMaterials: true,
    cathodeMaterials: true,
    membraneType: true,
    substrateType: true,
    performanceMetrics: true,
    operationalParameters: true,
    inSilicoAvailable: true,
    modelType: true,
    user: {
      select: {
        id: true,
        name: true,
        email: true,
      },
    },
    experiments: {
      select: {
        id: true,
        name: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    },
  } as const,

  /**
   * Index hints for common queries
   */
  indexHints: {
    paperSearch: Prisma.sql`/*+ INDEX(research_papers idx_title_abstract) */`,
    papersByYear: Prisma.sql`/*+ INDEX(research_papers idx_publication_date) */`,
    papersBySystem: Prisma.sql`/*+ INDEX(research_papers idx_system_type) */`,
  },
};

/**
 * Query batching utility for reducing database round trips
 */
export class QueryBatcher<T> {
  private batch: Map<string, Promise<T>> = new Map();
  private timer: NodeJS.Timeout | null = null;
  private results: Map<string, T> = new Map();

  constructor(
    private batchFn: (keys: string[]) => Promise<Map<string, T>>,
    private delay: number = 10
  ) {}

  async get(key: string): Promise<T | undefined> {
    // Check if already in batch
    const existing = this.batch.get(key);
    if (existing) return existing;

    // Create promise for this key
    const promise = new Promise<T>((resolve, reject) => {
      // Schedule batch execution
      if (this.timer) clearTimeout(this.timer);

      this.timer = setTimeout(async () => {
        const keys = Array.from(this.batch.keys());
        this.batch.clear();
        this.timer = null;

        try {
          const results = await this.batchFn(keys);

          // Resolve all promises
          keys.forEach((k) => {
            const result = results.get(k);
            if (result !== undefined) {
              this.results.set(k, result);
            }
          });

          const myResult = results.get(key);
          if (myResult !== undefined) {
            resolve(myResult);
          } else {
            reject(new Error(`No result for key: ${key}`));
          }
        } catch (error) {
          reject(error);
        }
      }, this.delay);
    });

    this.batch.set(key, promise);
    return promise;
  }

  clear() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.batch.clear();
    this.results.clear();
  }
}

/**
 * Optimized aggregation queries
 */
export const aggregationQueries = {
  /**
   * Get paper statistics with minimal queries
   */
  async getPaperStats(prisma: any, where?: any) {
    const [totalCount, systemTypes, yearStats, qualityStats] = await Promise.all([
      // Total count
      prisma.researchPaper.count({ where }),

      // System type distribution
      prisma.researchPaper.groupBy({
        by: ['systemType'],
        where: { ...where, systemType: { not: null } },
        _count: true,
        orderBy: { _count: { systemType: 'desc' } },
      }),

      // Year range and distribution
      prisma.researchPaper.aggregate({
        where,
        _min: { publicationDate: true },
        _max: { publicationDate: true },
      }),

      // Quality score statistics
      prisma.researchPaper.aggregate({
        where,
        _avg: { aiConfidence: true },
        _min: { aiConfidence: true },
        _max: { aiConfidence: true },
      }),
    ]);

    return {
      totalCount,
      systemTypes: systemTypes.map((st) => ({
        type: st.systemType,
        count: st._count,
      })),
      yearRange: {
        min: yearStats._min.publicationDate?.getFullYear() || new Date().getFullYear(),
        max: yearStats._max.publicationDate?.getFullYear() || new Date().getFullYear(),
      },
      qualityStats: {
        average: (qualityStats._avg.aiConfidence || 0) * 100,
        min: (qualityStats._min.aiConfidence || 0) * 100,
        max: (qualityStats._max.aiConfidence || 0) * 100,
      },
    };
  },

  /**
   * Get experiment statistics efficiently
   */
  async getExperimentStats(prisma: any, userId?: string) {
    const where = userId ? { userId } : {};

    const [totalCount, statusCounts, systemTypes, recentActivity] = await Promise.all([
      // Total experiments
      prisma.experiment.count({ where }),

      // Status distribution
      prisma.experiment.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),

      // System type distribution
      prisma.experiment.groupBy({
        by: ['systemType'],
        where,
        _count: true,
        orderBy: { _count: { systemType: 'desc' } },
      }),

      // Recent activity (last 7 days)
      prisma.experiment.count({
        where: {
          ...where,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    return {
      totalCount,
      statusCounts: Object.fromEntries(statusCounts.map((s) => [s.status, s._count])),
      systemTypes: systemTypes.map((st) => ({
        type: st.systemType,
        count: st._count,
      })),
      recentActivity,
    };
  },
};

/**
 * Database transaction helpers
 */
export const transactionHelpers = {
  /**
   * Retry transaction on conflict
   */
  async retryTransaction<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 100
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error: any) {
        lastError = error;

        // Only retry on specific errors
        if (
          error.code === 'P2034' || // Transaction conflict
          error.code === 'P2028' || // Transaction timeout
          error.message?.includes('deadlock')
        ) {
          // Exponential backoff
          await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, i)));
          continue;
        }

        // Don't retry other errors
        throw error;
      }
    }

    throw lastError || new Error('Transaction failed after retries');
  },

  /**
   * Batch insert with chunking
   */
  async batchInsert<T>(
    prisma: any,
    model: string,
    data: T[],
    chunkSize: number = 100
  ): Promise<number> {
    let inserted = 0;

    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);

      await prisma[model].createMany({
        data: chunk,
        skipDuplicates: true,
      });

      inserted += chunk.length;
    }

    return inserted;
  },

  /**
   * Optimized bulk update
   */
  async bulkUpdate<T extends { id: string }>(
    prisma: any,
    model: string,
    updates: T[]
  ): Promise<void> {
    // Use transaction for consistency
    await prisma.$transaction(
      updates.map(({ id, ...data }) =>
        prisma[model].update({
          where: { id },
          data,
        })
      )
    );
  },
};

/**
 * Query performance monitoring
 */
export class QueryMonitor {
  private static queries = new Map<
    string,
    {
      count: number;
      totalTime: number;
      avgTime: number;
      maxTime: number;
    }
  >();

  static async monitor<T>(name: string, queryFn: () => Promise<T>): Promise<T> {
    const start = performance.now();

    try {
      const result = await queryFn();
      const duration = performance.now() - start;

      this.recordQuery(name, duration);

      // Log slow queries
      if (duration > 1000) {
        console.warn(`Slow query detected: ${name} took ${duration.toFixed(2)}ms`);
      }

      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.recordQuery(name, duration, true);
      throw error;
    }
  }

  private static recordQuery(name: string, duration: number, error: boolean = false) {
    const existing = this.queries.get(name) || {
      count: 0,
      totalTime: 0,
      avgTime: 0,
      maxTime: 0,
    };

    existing.count++;
    existing.totalTime += duration;
    existing.avgTime = existing.totalTime / existing.count;
    existing.maxTime = Math.max(existing.maxTime, duration);

    this.queries.set(name, existing);
  }

  static getStats() {
    const stats: Record<string, any> = {};

    this.queries.forEach((data, name) => {
      stats[name] = {
        ...data,
        avgTime: data.avgTime.toFixed(2) + 'ms',
        maxTime: data.maxTime.toFixed(2) + 'ms',
        totalTime: data.totalTime.toFixed(2) + 'ms',
      };
    });

    return stats;
  }

  static reset() {
    this.queries.clear();
  }
}
