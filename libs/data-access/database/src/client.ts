import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const isProduction = process.env['NODE_ENV'] === 'production';
  const isLocalDevelopment = process.env['DATABASE_URL']?.includes('localhost');

  // Get database URL from environment with validation
  const databaseUrl = process.env['DATABASE_URL'];

  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  // Validate DATABASE_URL format
  try {
    new URL(databaseUrl);
  } catch {
    throw new Error('DATABASE_URL must be a valid URL');
  }

  // Determine if we should use Prisma Accelerate (production remote databases only)
  const accelerateUrl = process.env['PRISMA_ACCELERATE_URL'];
  const useAccelerate = !!(accelerateUrl && isProduction && !isLocalDevelopment);

  // Use Accelerate URL if available and appropriate, otherwise use direct URL
  let connectionUrl = useAccelerate ? accelerateUrl : databaseUrl;

  // Add connection pooling for PostgreSQL (except when using Accelerate)
  if (!useAccelerate && connectionUrl.includes('postgres')) {
    try {
      const url = new URL(connectionUrl);

      // Optimize connection settings based on environment
      if (isLocalDevelopment) {
        // Local development: fewer connections, faster timeouts
        url.searchParams.set('connection_limit', '10');
        url.searchParams.set('pool_timeout', '20');
      } else {
        // Remote database: more conservative settings
        url.searchParams.set('connection_limit', '5');
        url.searchParams.set('pool_timeout', '10');
      }

      connectionUrl = url.toString();
    } catch (error) {
      console.warn('Failed to parse DATABASE_URL for connection pooling:', error);
      // Continue with original URL if parsing fails
    }
  }

  // Configure logging based on environment
  const logLevels = isProduction
    ? ['error']
    : process.env['DATABASE_LOGGING'] === 'true'
    ? ['query', 'info', 'warn', 'error']
    : ['error', 'warn'];

  const client = new PrismaClient({
    datasources: {
      db: {
        url: connectionUrl,
      },
    },
    log: logLevels as any,
  });

  // Add middleware for query performance monitoring
  if (!isProduction) {
    client.$use(async (params, next) => {
      const before = Date.now();

      try {
        const result = await next(params);
        const duration = Date.now() - before;

        // Log slow queries
        if (duration > 100) {
          console.warn(`Slow Query (${duration}ms): ${params.model}.${params.action}`);
        }

        return result;
      } catch (error) {
        const duration = Date.now() - before;
        console.error(`Query Error (${duration}ms): ${params.model}.${params.action}`, error);
        throw error;
      }
    });
  }

  // Add query event logging for detailed monitoring
  if (process.env['DATABASE_QUERY_LOGGING'] === 'true') {
    client.$on('query' as never, (e: any) => {
      if (e.duration > 500) {
        console.warn(`Very Slow Query (${e.duration}ms):`, {
          query: e.query,
          params: e.params,
          target: e.target,
        });
      }
    });
  }

  return client;
}

// Lazy initialization to prevent build-time errors
let _prisma: PrismaClient | undefined;

export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop) {
    if (!_prisma) {
      _prisma = globalForPrisma.prisma ?? createPrismaClient();
      if (process.env['NODE_ENV'] !== 'production') {
        globalForPrisma.prisma = _prisma;
      }
    }
    return (_prisma as any)[prop];
  },
});

// Note: globalForPrisma.prisma is set inside the proxy getter

// Handle cleanup on process termination
if (typeof process !== 'undefined') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });

  process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

// Graceful shutdown helper
export async function disconnectPrisma() {
  if (_prisma) {
    await _prisma.$disconnect();
    _prisma = undefined;
    if (globalForPrisma.prisma === _prisma) {
      globalForPrisma.prisma = undefined;
    }
  }
}

// Connection health check
export async function checkDatabaseConnection(): Promise<{
  connected: boolean;
  latency?: number;
  error?: any;
}> {
  const start = Date.now();

  try {
    await prisma.$queryRaw`SELECT 1`;
    const latency = Date.now() - start;

    return {
      connected: true,
      latency,
    };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Execute raw SQL with monitoring
export async function executeRawQuery<T = unknown>(query: string, params?: any[]): Promise<T> {
  const start = Date.now();

  try {
    const result = await prisma.$queryRawUnsafe<T>(query, ...(params || []));
    const duration = Date.now() - start;

    if (duration > 100) {
      console.warn(`Slow Raw Query (${duration}ms):`, query.substring(0, 100));
    }

    return result;
  } catch (error) {
    const duration = Date.now() - start;
    console.error(`Raw Query Error (${duration}ms):`, query.substring(0, 100), error);
    throw error;
  }
}

export default prisma;
