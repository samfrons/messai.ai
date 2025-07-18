import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const isProduction = process.env.NODE_ENV === 'production';

  // Get database URL from environment
  const databaseUrl = process.env['DATABASE_URL'];

  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  // Add connection pooling params for PostgreSQL
  let finalUrl = databaseUrl;

  if (databaseUrl.includes('postgres')) {
    try {
      const url = new URL(databaseUrl.replace('postgresql://', 'postgres://'));

      // Optimize connection settings based on environment
      if (isProduction) {
        // Production: Conservative settings for stability
        url.searchParams.set('connection_limit', '5');
        url.searchParams.set('pool_timeout', '10');
      } else {
        // Development: More connections for faster development
        url.searchParams.set('connection_limit', '10');
        url.searchParams.set('pool_timeout', '20');
      }

      finalUrl = url.toString().replace('postgres://', 'postgresql://');
    } catch (e) {
      console.warn('Failed to parse DATABASE_URL for connection pooling:', e);
      // Continue with original URL if parsing fails
      finalUrl = databaseUrl;
    }
  }

  const client = new PrismaClient({
    datasources: {
      db: {
        url: finalUrl,
      },
    },
    log: isProduction ? ['error'] : ['error', 'warn'],
  });

  return client;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env['NODE_ENV'] !== 'production') {
  globalForPrisma.prisma = prisma;
}
