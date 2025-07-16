import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';

export async function GET(request: NextRequest) {
  try {
    console.log('=== DB Test API ===');
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('FORCE_POSTGRES:', process.env.FORCE_POSTGRES);
    console.log('NODE_ENV:', process.env.NODE_ENV);

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        {
          error: 'DATABASE_URL not found in environment',
          env: {
            NODE_ENV: process.env.NODE_ENV,
            FORCE_POSTGRES: process.env.FORCE_POSTGRES,
          },
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
        environment: {
          NODE_ENV: process.env.NODE_ENV,
          FORCE_POSTGRES: process.env.FORCE_POSTGRES,
          DATABASE_URL_SET: !!process.env.DATABASE_URL,
        },
      },
    });
  } catch (error) {
    console.error('DB Test API Error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
