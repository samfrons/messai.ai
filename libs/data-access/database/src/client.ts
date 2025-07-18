import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const isProduction = process.env.NODE_ENV === 'production';
  const isLocalDevelopment = process.env.DATABASE_URL?.includes('localhost');

  // Get database URL from environment
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  // Determine if we should use Prisma Accelerate (production remote databases only)
  const accelerateUrl = process.env.PRISMA_ACCELERATE_URL;
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
    : process.env.DATABASE_LOGGING === 'true'
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

  return client;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

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

export default prisma;
