import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds timeout

// IMPORTANT: Add authentication before using in production!
export async function POST(request: Request) {
  try {
    // Security check - add proper authentication here
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify production environment
    const isProduction =
      process.env.NODE_ENV === 'production' ||
      process.env.DATABASE_URL?.includes('supabase') ||
      process.env.DATABASE_URL?.includes('neon');

    if (!isProduction) {
      return NextResponse.json(
        {
          error: 'This endpoint only works in production',
        },
        { status: 400 }
      );
    }

    // Load export data
    const exportPath = path.join(process.cwd(), 'data', 'priority-papers-export.json');
    if (!fs.existsSync(exportPath)) {
      return NextResponse.json(
        {
          error: 'Export file not found',
        },
        { status: 404 }
      );
    }

    const exportData = JSON.parse(fs.readFileSync(exportPath, 'utf-8'));

    const stats = {
      added: 0,
      skipped: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Import papers
    for (const paperData of exportData.papers) {
      try {
        // Check if already exists
        if (paperData.doi) {
          const existing = await prisma.researchPaper.findUnique({
            where: { doi: paperData.doi },
          });

          if (existing) {
            stats.skipped++;
            continue;
          }
        }

        // Create paper
        await prisma.researchPaper.create({
          data: {
            ...paperData,
            publicationDate: paperData.publicationDate
              ? new Date(paperData.publicationDate)
              : undefined,
          },
        });

        stats.added++;
      } catch (error: any) {
        stats.failed++;
        stats.errors.push(`${paperData.doi}: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      stats,
      message: `Import complete: ${stats.added} added, ${stats.skipped} skipped, ${stats.failed} failed`,
    });
  } catch (error: any) {
    console.error('Import error:', error);
    return NextResponse.json(
      {
        error: 'Import failed',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// GET method to check status
export async function GET() {
  const paperCount = await prisma.researchPaper.count();
  return NextResponse.json({
    status: 'Ready to import',
    currentPaperCount: paperCount,
    environment: process.env.NODE_ENV,
  });
}
