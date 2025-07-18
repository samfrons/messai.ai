import { NextRequest, NextResponse } from 'next/server';
import { getCacheStats } from '../../../lib/cache';
import { MetricsCollector } from '../../../lib/logger';
import { apiKeySchema, validateRequest } from '../../../lib/validation';

export async function GET(request: NextRequest) {
  try {
    // Require API key for monitoring endpoint
    const apiKey = request.headers.get('x-api-key');

    if (!apiKey || apiKey !== process.env.MONITORING_API_KEY) {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'Unauthorized',
            code: 'UNAUTHORIZED',
          },
        },
        { status: 401 }
      );
    }

    // Collect various metrics
    const [cacheStats, performanceStats] = await Promise.all([
      getCacheStats(),
      Promise.resolve(MetricsCollector.getAllStats()),
    ]);

    // System health checks
    const healthChecks = {
      database: await checkDatabaseHealth(),
      cache: checkCacheHealth(cacheStats),
      memory: getMemoryUsage(),
      uptime: process.uptime(),
    };

    // Application metrics
    const appMetrics = {
      nodejs: {
        version: process.version,
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        deploymentEnv: process.env.VERCEL_ENV || 'local',
      },
    };

    return NextResponse.json({
      data: {
        timestamp: new Date().toISOString(),
        health: healthChecks,
        cache: cacheStats,
        performance: performanceStats,
        system: appMetrics,
      },
      error: null,
    });
  } catch (error) {
    console.error('Monitoring error:', error);
    return NextResponse.json(
      {
        data: null,
        error: {
          message: 'Failed to collect monitoring data',
          code: 'MONITORING_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

// Health check functions
async function checkDatabaseHealth() {
  try {
    const { prisma } = await import('@messai/database');
    const startTime = Date.now();

    // Simple query to check database connectivity
    await prisma.$queryRaw`SELECT 1`;

    const responseTime = Date.now() - startTime;

    return {
      status: 'healthy',
      responseTime,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

function checkCacheHealth(cacheStats: any) {
  let totalHitRate = 0;
  let cacheCount = 0;

  Object.values(cacheStats).forEach((stat: any) => {
    if (stat.hitRate !== undefined) {
      totalHitRate += stat.hitRate;
      cacheCount++;
    }
  });

  const avgHitRate = cacheCount > 0 ? totalHitRate / cacheCount : 0;

  return {
    status: avgHitRate > 0.5 ? 'healthy' : 'degraded',
    avgHitRate,
    details: cacheStats,
  };
}

function getMemoryUsage() {
  const usage = process.memoryUsage();
  const totalMemory = process.memoryUsage().heapTotal;

  return {
    heapUsed: `${(usage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
    heapTotal: `${(usage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
    external: `${(usage.external / 1024 / 1024).toFixed(2)} MB`,
    rss: `${(usage.rss / 1024 / 1024).toFixed(2)} MB`,
    usagePercentage: ((usage.heapUsed / totalMemory) * 100).toFixed(2) + '%',
  };
}
