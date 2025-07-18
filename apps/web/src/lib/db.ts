import { PrismaClient } from '../../../../generated/prisma';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const isProduction = process.env.NODE_ENV === 'production';
  // const isDevelopment = process.env.NODE_ENV === 'development'; // TODO: Use for dual database approach

  // Determine which URL to use based on environment
  let connectionUrl: string;

  if (
    process.env['DATABASE_URL']?.includes('postgres') &&
    (isProduction || process.env['FORCE_POSTGRES'] === 'true')
  ) {
    // Production PostgreSQL or forced PostgreSQL
    connectionUrl = process.env['DATABASE_URL'];
  } else if (process.env['DATABASE_URL']?.startsWith('file:')) {
    // Explicit SQLite URL
    connectionUrl = process.env['DATABASE_URL'];
  } else {
    // Default to PostgreSQL for development
    connectionUrl = process.env['DATABASE_URL'] || 'file:./prisma/dev.db';
  }

  // For PostgreSQL connections, add connection pooling params
  let finalUrl = connectionUrl;

  if (connectionUrl.includes('postgres')) {
    try {
      const url = new URL(connectionUrl.replace('postgresql://', 'postgres://'));
      url.searchParams.set('connection_limit', '5'); // Reduce connection limit
      url.searchParams.set('pool_timeout', '10'); // Shorter timeout
      finalUrl = url.toString().replace('postgres://', 'postgresql://');
    } catch (e) {
      // If URL parsing fails, use the original connection string
      finalUrl = connectionUrl;
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
