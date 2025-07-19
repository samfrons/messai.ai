import { LRUCache } from 'lru-cache';

export interface UsageRecord {
  timestamp: Date;
  path: string;
  method: string;
  userId?: string;
  apiKey?: string;
  responseTime: number;
  statusCode: number;
}

export interface UsageStats {
  period: {
    start: Date;
    end: Date;
  };
  requests: {
    total: number;
    successful: number;
    failed: number;
  };
  endpoints: Array<{
    path: string;
    method: string;
    count: number;
    avgResponseTime: number;
  }>;
  quota: {
    limit: number;
    used: number;
    remaining: number;
  };
}

// In-memory storage for usage data (consider time-series DB for production)
const usageCache = new LRUCache<string, UsageRecord[]>({
  max: 10000,
  ttl: 24 * 60 * 60 * 1000, // 24 hours
});

export async function trackUsage(record: UsageRecord): Promise<void> {
  const key = record.userId || record.apiKey || 'anonymous';
  const existing = usageCache.get(key) || [];
  existing.push(record);
  usageCache.set(key, existing);
}

export async function getUsageStats(
  userId: string,
  period: 'hour' | 'day' | 'week' | 'month'
): Promise<UsageStats> {
  const now = new Date();
  const start = new Date(now);

  switch (period) {
    case 'hour':
      start.setHours(start.getHours() - 1);
      break;
    case 'day':
      start.setDate(start.getDate() - 1);
      break;
    case 'week':
      start.setDate(start.getDate() - 7);
      break;
    case 'month':
      start.setMonth(start.getMonth() - 1);
      break;
  }

  const records = usageCache.get(userId) || [];
  const filteredRecords = records.filter(
    (record) => record.timestamp >= start && record.timestamp <= now
  );

  // Calculate statistics
  const total = filteredRecords.length;
  const successful = filteredRecords.filter((r) => r.statusCode < 400).length;
  const failed = total - successful;

  // Group by endpoint
  const endpointMap = new Map<string, { count: number; totalTime: number }>();

  filteredRecords.forEach((record) => {
    const key = `${record.method} ${record.path}`;
    const existing = endpointMap.get(key) || { count: 0, totalTime: 0 };
    existing.count++;
    existing.totalTime += record.responseTime;
    endpointMap.set(key, existing);
  });

  // Convert to array and calculate averages
  const endpoints = Array.from(endpointMap.entries())
    .map(([key, stats]) => {
      const [method, ...pathParts] = key.split(' ');
      return {
        path: pathParts.join(' '),
        method,
        count: stats.count,
        avgResponseTime: stats.totalTime / stats.count,
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Top 10 endpoints

  // Calculate quota (simplified - in production, check user tier)
  const quotaLimit = 1000; // Default for authenticated users

  return {
    period: {
      start,
      end: now,
    },
    requests: {
      total,
      successful,
      failed,
    },
    endpoints,
    quota: {
      limit: quotaLimit,
      used: total,
      remaining: Math.max(0, quotaLimit - total),
    },
  };
}

// Middleware helper to track API usage
export function createUsageTrackingMiddleware() {
  return async (request: Request, response: Response, next: () => void) => {
    const startTime = Date.now();

    // Capture original end method
    const originalEnd = response.end;

    // Override end method to track usage
    response.end = function (...args: any[]) {
      const responseTime = Date.now() - startTime;

      const record: UsageRecord = {
        timestamp: new Date(),
        path: request.url,
        method: request.method,
        userId: (request as any).userId,
        apiKey: request.headers.get('x-api-key') || undefined,
        responseTime,
        statusCode: response.status,
      };

      // Track usage asynchronously
      trackUsage(record).catch(console.error);

      // Call original end method
      return originalEnd.apply(response, args);
    };

    next();
  };
}
