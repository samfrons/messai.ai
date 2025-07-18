import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.error || !body.timestamp) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Log error details (in production, send to monitoring service)
    console.error('Client-side error report:', {
      error: body.error,
      errorInfo: body.errorInfo,
      timestamp: body.timestamp,
      url: body.url,
      userAgent: body.userAgent,
    });

    // In production, you would send this to your monitoring service
    // Example: Sentry, LogRocket, Datadog, etc.
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to monitoring service
      // await sendToMonitoringService(body);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reporting endpoint failed:', error);

    // Don't return error details to client for security
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
