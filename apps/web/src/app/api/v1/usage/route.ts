import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { getUsageStats } from '../../../../lib/services/usage-tracking';

const querySchema = z.object({
  period: z.enum(['hour', 'day', 'week', 'month']).default('day'),
});

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    const apiKey = request.headers.get('x-api-key');

    if (!session?.user && !apiKey) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Authentication required',
        },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = {
      period: searchParams.get('period') || 'day',
    };

    const validatedParams = querySchema.parse(queryParams);

    // Get usage stats
    const userId = session?.user?.id || apiKey || 'anonymous';
    const stats = await getUsageStats(userId, validatedParams.period);

    // Transform dates to ISO strings
    const response = {
      period: {
        start: stats.period.start.toISOString(),
        end: stats.period.end.toISOString(),
      },
      requests: stats.requests,
      endpoints: stats.endpoints,
      quota: stats.quota,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching usage stats:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          message: 'Invalid query parameters',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'An error occurred while fetching usage statistics',
      },
      { status: 500 }
    );
  }
}
