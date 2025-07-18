import { NextRequest, NextResponse } from 'next/server';
import { getCacheStats } from '../../../lib/cache';

export async function GET(_request: NextRequest) {
  try {
    const stats = getCacheStats();

    // Calculate overall metrics
    let totalHits = 0;
    let totalMisses = 0;
    let totalSize = 0;
    let totalCalculatedSize = 0;

    Object.values(stats).forEach((stat: any) => {
      totalHits += stat.hits || 0;
      totalMisses += stat.misses || 0;
      totalSize += stat.size || 0;
      totalCalculatedSize += stat.calculatedSize || 0;
    });

    const overallHitRate = totalHits / (totalHits + totalMisses) || 0;

    return NextResponse.json({
      data: {
        caches: stats,
        overall: {
          totalHits,
          totalMisses,
          overallHitRate,
          totalSize,
          totalCalculatedSize,
          totalCalculatedSizeMB: (totalCalculatedSize / (1024 * 1024)).toFixed(2),
        },
        timestamp: new Date().toISOString(),
      },
      error: null,
    });
  } catch (error) {
    console.error('Cache status error:', error);
    return NextResponse.json(
      {
        data: null,
        error: {
          message: 'Failed to get cache status',
          code: 'CACHE_STATUS_ERROR',
        },
      },
      { status: 500 }
    );
  }
}
