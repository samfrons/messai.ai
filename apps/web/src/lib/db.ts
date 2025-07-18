// Temporarily use direct Prisma import for build compatibility
const { PrismaClient } = require('@prisma/client');

const globalForPrisma = globalThis as unknown as {
  prisma: any | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
