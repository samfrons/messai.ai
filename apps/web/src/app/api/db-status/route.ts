import { NextRequest, NextResponse } from 'next/server';
import { checkDatabaseConnection, prisma } from '@messai/database';
import { QueryMonitor } from '../../../lib/db-optimization';

export async function GET(request: NextRequest) {
  try {
    // Check if monitoring is enabled
    const apiKey = request.headers.get('x-api-key');
    if (apiKey !== process.env.MONITORING_API_KEY) {
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

    // Database connection check
    const connectionStatus = await checkDatabaseConnection();

    // Get database statistics
    const [tableStats, poolStats] = await Promise.all([
      getTableStatistics(),
      getDatabasePoolStats(),
    ]);

    // Get query performance stats
    const queryStats = QueryMonitor.getStats();

    return NextResponse.json({
      data: {
        connection: connectionStatus,
        tables: tableStats,
        pool: poolStats,
        queries: queryStats,
        timestamp: new Date().toISOString(),
      },
      error: null,
    });
  } catch (error) {
    console.error('Database status error:', error);
    return NextResponse.json(
      {
        data: null,
        error: {
          message: 'Failed to get database status',
          code: 'DB_STATUS_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

async function getTableStatistics() {
  try {
    const [papers, experiments, users] = await Promise.all([
      prisma.researchPaper.count(),
      prisma.experiment.count(),
      prisma.user.count(),
    ]);

    // Get table sizes (PostgreSQL specific)
    const tableSizes = await prisma.$queryRaw<any[]>`
      SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
        pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
      LIMIT 10
    `;

    return {
      counts: {
        researchPapers: papers,
        experiments,
        users,
      },
      sizes: tableSizes,
    };
  } catch (error) {
    console.error('Failed to get table statistics:', error);
    return null;
  }
}

async function getDatabasePoolStats() {
  try {
    // Get active connections (PostgreSQL specific)
    const activeConnections = await prisma.$queryRaw<any[]>`
      SELECT 
        count(*) as total,
        count(*) FILTER (WHERE state = 'active') as active,
        count(*) FILTER (WHERE state = 'idle') as idle,
        count(*) FILTER (WHERE state = 'idle in transaction') as idle_in_transaction,
        count(*) FILTER (WHERE wait_event IS NOT NULL) as waiting
      FROM pg_stat_activity
      WHERE datname = current_database()
    `;

    // Get connection details
    const connectionDetails = await prisma.$queryRaw<any[]>`
      SELECT 
        client_addr,
        state,
        state_change,
        wait_event,
        query_start,
        SUBSTRING(query, 1, 100) as query_preview
      FROM pg_stat_activity
      WHERE datname = current_database()
      AND state != 'idle'
      ORDER BY query_start DESC
      LIMIT 10
    `;

    return {
      summary: activeConnections[0] || {},
      activeQueries: connectionDetails,
    };
  } catch (error) {
    console.error('Failed to get pool statistics:', error);
    return null;
  }
}
