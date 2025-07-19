import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering to prevent build-time execution
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Forward request to ML service
    const response = await fetch(`${ML_SERVICE_URL}/api/ml/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.detail || 'ML prediction failed' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('ML prediction error:', error);
    return NextResponse.json({ error: 'Failed to connect to ML service' }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Get available models
    const response = await fetch(`${ML_SERVICE_URL}/api/ml/models`);

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch models' }, { status: response.status });
    }

    const models = await response.json();
    return NextResponse.json(models);
  } catch (error) {
    console.error('ML models fetch error:', error);
    return NextResponse.json({ error: 'Failed to connect to ML service' }, { status: 500 });
  }
}
