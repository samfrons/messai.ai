import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';

export async function GET() {
  let databaseStatus = 'operational';
  let status = 'healthy';

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    console.error('Database health check failed:', error);
    databaseStatus = 'failed';
    status = 'unhealthy';
  }

  const healthCheck = {
    status,
    timestamp: new Date().toISOString(),
    version: process.env['NEXT_PUBLIC_APP_VERSION'] || '1.0.0',
    services: {
      core: 'operational',
      ui: 'operational',
      api: 'operational',
      database: databaseStatus,
    },
    // Only return environment type, not the actual NODE_ENV value
    environment: process.env.NODE_ENV === 'production' ? 'production' : 'non-production',
  };

  return NextResponse.json(healthCheck, {
    status: status === 'healthy' ? 200 : 503,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
    },
  });
}
