import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { prisma } = await import('../../../lib/db');

    // Simple count query
    const count = await prisma.researchPaper.count();

    return NextResponse.json({
      success: true,
      count,
      message: `Found ${count} research papers`,
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
