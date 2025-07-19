import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { z } from 'zod';
import { PapersQuerySchema } from '../../../../lib/openapi/schemas';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse and validate query parameters
    const queryParams = {
      search: searchParams.get('search') || undefined,
      systemType: searchParams.get('systemType') || undefined,
      yearStart: searchParams.get('yearStart')
        ? parseInt(searchParams.get('yearStart')!)
        : undefined,
      yearEnd: searchParams.get('yearEnd') ? parseInt(searchParams.get('yearEnd')!) : undefined,
      qualityScoreMin: searchParams.get('qualityScoreMin')
        ? parseFloat(searchParams.get('qualityScoreMin')!)
        : undefined,
      sort: searchParams.get('sort') || 'relevance',
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '40'),
      verified: searchParams.get('verified') ? searchParams.get('verified') === 'true' : undefined,
    };

    // Validate query parameters
    const validatedParams = PapersQuerySchema.parse(queryParams);

    const startTime = Date.now();

    // Build where clause
    const where: any = {};

    if (validatedParams.search) {
      where.OR = [
        { title: { contains: validatedParams.search, mode: 'insensitive' } },
        { abstract: { contains: validatedParams.search, mode: 'insensitive' } },
      ];
    }

    if (validatedParams.systemType) {
      where.systemType = validatedParams.systemType;
    }

    if (validatedParams.yearStart || validatedParams.yearEnd) {
      where.publicationDate = {};
      if (validatedParams.yearStart) {
        where.publicationDate.gte = new Date(`${validatedParams.yearStart}-01-01`);
      }
      if (validatedParams.yearEnd) {
        where.publicationDate.lte = new Date(`${validatedParams.yearEnd}-12-31`);
      }
    }

    if (validatedParams.qualityScoreMin !== undefined) {
      where.aiConfidence = { gte: validatedParams.qualityScoreMin / 100 };
    }

    if (validatedParams.verified !== undefined) {
      where.isPublic = validatedParams.verified;
    }

    // Build orderBy clause
    let orderBy: any = {};
    switch (validatedParams.sort) {
      case 'date':
        orderBy = { publicationDate: 'desc' };
        break;
      case 'quality':
        orderBy = { aiConfidence: 'desc' };
        break;
      case 'citations':
        orderBy = { powerOutput: 'desc' }; // Using powerOutput as proxy for citations
        break;
      default:
        orderBy = { aiConfidence: 'desc' }; // Default to quality for relevance
    }

    // Execute queries in parallel
    const [papers, totalCount] = await Promise.all([
      prisma.researchPaper.findMany({
        where,
        orderBy,
        skip: (validatedParams.page - 1) * validatedParams.limit,
        take: validatedParams.limit,
      }),
      prisma.researchPaper.count({ where }),
    ]);

    // Get system type distribution
    const systemTypeGroups = await prisma.researchPaper.groupBy({
      by: ['systemType'],
      _count: true,
      where: validatedParams.search ? where : {},
    });

    const systemTypes = systemTypeGroups.reduce((acc, group) => {
      if (group.systemType) {
        acc[group.systemType] = group._count;
      }
      return acc;
    }, {} as Record<string, number>);

    // Get year range
    const yearRange = await prisma.researchPaper.aggregate({
      _min: { publicationDate: true },
      _max: { publicationDate: true },
      where: validatedParams.search ? where : {},
    });

    const minYear = yearRange._min.publicationDate
      ? new Date(yearRange._min.publicationDate).getFullYear()
      : 2000;
    const maxYear = yearRange._max.publicationDate
      ? new Date(yearRange._max.publicationDate).getFullYear()
      : new Date().getFullYear();

    // Transform papers to API format
    const transformedPapers = papers.map((paper) => ({
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
    }));

    const searchTime = (Date.now() - startTime) / 1000;

    return NextResponse.json({
      data: {
        papers: transformedPapers,
        pagination: {
          page: validatedParams.page,
          limit: validatedParams.limit,
          total: totalCount,
          pages: Math.ceil(totalCount / validatedParams.limit),
        },
        stats: {
          totalResults: totalCount,
          systemTypes,
          yearRange: { min: minYear, max: maxYear },
        },
        searchTime,
        suggestions: validatedParams.search
          ? await generateSuggestions(validatedParams.search)
          : undefined,
      },
      error: null,
    });
  } catch (error) {
    console.error('Error fetching papers:', error);

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
        message: 'An error occurred while fetching papers',
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

async function generateSuggestions(search: string): Promise<string[]> {
  // Simple suggestion generation based on common terms
  const suggestions: string[] = [];

  // Try to find related terms
  const relatedTerms = await prisma.researchPaper.findMany({
    where: {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { abstract: { contains: search, mode: 'insensitive' } },
      ],
    },
    select: { title: true },
    take: 5,
  });

  // Extract unique words from titles as suggestions
  const words = new Set<string>();
  relatedTerms.forEach((paper) => {
    const titleWords = paper.title.toLowerCase().split(/\s+/);
    titleWords.forEach((word) => {
      if (word.length > 4 && !word.includes(search.toLowerCase())) {
        words.add(word);
      }
    });
  });

  return Array.from(words).slice(0, 5);
}
