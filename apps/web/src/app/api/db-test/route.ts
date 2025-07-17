import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';

export async function GET(_request: NextRequest) {
  try {
    if (!process.env['DATABASE_URL']) {
      return NextResponse.json(
        {
          error: 'DATABASE_URL not found in environment',
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    // Test database connection
    const count = await prisma.researchPaper.count();

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: {
        totalPapers: count,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Database connection failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
