import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/db';
import { z } from 'zod';

const paramsSchema = z.object({
  id: z.string().uuid(),
});

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Validate the ID parameter
    const validatedParams = paramsSchema.parse(params);

    // Fetch the paper
    const paper = await prisma.researchPaper.findUnique({
      where: { id: validatedParams.id },
    });

    if (!paper) {
      return NextResponse.json(
        {
          error: 'Not found',
          message: 'Paper not found',
        },
        { status: 404 }
      );
    }

    // Transform to API format
    const transformedPaper = {
      id: paper.id,
      title: paper.title,
      abstract: cleanAbstract(paper.abstract || ''),
      authors: parseAuthors(paper.authors),
      publicationDate: paper.publicationDate.toISOString(),
      year: paper.publicationDate.getFullYear(),
      url: paper.externalUrl,
      pdfUrl: paper.externalUrl,
      systemType: paper.systemType || 'MFC',
      qualityScore: Math.round((paper.aiConfidence || 0) * 100),
      citationCount: paper.powerOutput || 0,
      verified: paper.isPublic || false,
      tags: paper.tags || [],
      metadata: paper.metadata || {},
    };

    return NextResponse.json(transformedPaper);
  } catch (error) {
    console.error('Error fetching paper:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          message: 'Invalid paper ID format',
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'An error occurred while fetching the paper',
      },
      { status: 500 }
    );
  }
}

function cleanAbstract(text: string): string {
  return text
    .replace(/<jats:[^>]*>/g, '')
    .replace(/<\/jats:[^>]*>/g, '')
    .replace(/<[^>]*>/g, '')
    .trim();
}

function parseAuthors(authors: any): string[] {
  if (!authors) return [];
  if (typeof authors === 'string') {
    try {
      return JSON.parse(authors);
    } catch {
      return [authors];
    }
  }
  if (Array.isArray(authors)) return authors;
  return [];
}
