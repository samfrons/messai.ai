import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '../../../lib/db'; // Unused - endpoint disabled

export async function GET(_request: NextRequest) {
  // FIXME: This endpoint is currently disabled as the Prediction model doesn't exist
  return NextResponse.json(
    {
      data: null,
      error: {
        message: 'Predictions endpoint temporarily disabled - model not found in schema',
        code: 'MODEL_NOT_FOUND',
      },
    },
    { status: 501 }
  );
}

export async function POST(_request: NextRequest) {
  // FIXME: This endpoint is currently disabled as the Prediction model doesn't exist
  return NextResponse.json(
    {
      data: null,
      error: {
        message: 'Predictions endpoint temporarily disabled - model not found in schema',
        code: 'MODEL_NOT_FOUND',
      },
    },
    { status: 501 }
  );
}
