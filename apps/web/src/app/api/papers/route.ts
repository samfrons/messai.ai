import { NextRequest, NextResponse } from 'next/server';
import { prisma, transformSearchResults } from '@messai/database';
import type { DatabaseSearchResults } from '@messai/database';

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const search = searchParams.get('search') || '';
    const sort = searchParams.get('sort') || 'relevance';
    const page = parseInt(searchParams.get('page') || '0', 10);
    const limit = parseInt(searchParams.get('limit') || '40', 10);

    // Parse filters
    const yearStart = searchParams.get('yearStart');
    const yearEnd = searchParams.get('yearEnd');
    const minCitations = searchParams.get('minCitations');
    const minQualityScore = searchParams.get('minQualityScore');
    const hasMetrics = searchParams.get('hasMetrics') === 'true';
    const verified = searchParams.get('verified') === 'true';

    // Build where clause
    const where: any = {};

    // Search query
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { abstract: { contains: search, mode: 'insensitive' } },
        { authors: { contains: search, mode: 'insensitive' } },
        { journal: { contains: search, mode: 'insensitive' } },
        { systemType: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Year range filter
    if (yearStart || yearEnd) {
      const dateFilters: any = {};
      if (yearStart) {
        dateFilters.gte = new Date(`${yearStart}-01-01`);
      }
      if (yearEnd) {
        dateFilters.lte = new Date(`${yearEnd}-12-31`);
      }
      where.publicationDate = dateFilters;
    }

    // Citation filter (use powerOutput as proxy)
    if (minCitations) {
      where.powerOutput = { gte: parseInt(minCitations, 10) };
    }

    // Quality score filter (use aiConfidence as proxy)
    if (minQualityScore) {
      where.aiConfidence = { gte: parseFloat(minQualityScore) / 100 };
    }

    // Performance metrics filter
    if (hasMetrics) {
      where.powerOutput = { not: null };
    }

    // Verified filter (use isPublic as proxy)
    if (verified) {
      where.isPublic = true;
    }

    // Determine sort order
    let orderBy: any = {};
    switch (sort) {
      case 'date':
      case 'year-desc':
        orderBy = { publicationDate: 'desc' };
        break;
      case 'year-asc':
        orderBy = { publicationDate: 'asc' };
        break;
      case 'citations':
      case 'citations-desc':
        orderBy = { powerOutput: 'desc' };
        break;
      case 'citations-asc':
        orderBy = { powerOutput: 'asc' };
        break;
      case 'quality':
      case 'quality-desc':
        orderBy = { aiConfidence: 'desc' };
        break;
      case 'quality-asc':
        orderBy = { aiConfidence: 'asc' };
        break;
      case 'added-desc':
        orderBy = { createdAt: 'desc' };
        break;
      case 'relevance':
      default:
        orderBy = [{ aiConfidence: 'desc' }, { createdAt: 'desc' }];
        break;
    }

    // Execute queries in parallel
    const [papers, totalCount] = await Promise.all([
      prisma.researchPaper.findMany({
        where,
        orderBy,
        skip: page * limit,
        take: limit,
      }),
      prisma.researchPaper.count({ where }),
    ]);

    // Create database search results
    const dbResults: DatabaseSearchResults = {
      papers,
      totalCount,
      page,
      pageSize: limit,
      totalPages: Math.ceil(totalCount / limit),
      searchTime: Date.now() - startTime,
    };

    // Transform to API format
    const apiResults = transformSearchResults(dbResults, search);

    return NextResponse.json({
      data: apiResults,
      error: null,
    });
  } catch (error) {
    console.error('Papers API error:', error);
    return NextResponse.json(
      {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'Failed to fetch papers',
          code: 'FETCH_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      title,
      abstract,
      authors,
      journal,
      doi,
      externalUrl,
      systemType,
      powerOutput,
      efficiency,
    } = body;

    // Validate required fields
    if (!title || !authors || !externalUrl) {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'Missing required fields: title, authors, externalUrl',
            code: 'VALIDATION_ERROR',
          },
        },
        { status: 400 }
      );
    }

    // Create new research paper
    const paper = await prisma.researchPaper.create({
      data: {
        title,
        abstract: abstract || '',
        authors: JSON.stringify(Array.isArray(authors) ? authors : [authors]),
        journal: journal || '',
        doi: doi || null,
        externalUrl,
        systemType: systemType || null,
        powerOutput: powerOutput || null,
        efficiency: efficiency || null,
        keywords: JSON.stringify([]),
        source: 'user',
        isPublic: true,
      },
    });

    return NextResponse.json({
      data: { id: paper.id, message: 'Paper created successfully' },
      error: null,
    });
  } catch (error) {
    console.error('Create paper error:', error);
    return NextResponse.json(
      {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'Failed to create paper',
          code: 'CREATE_ERROR',
        },
      },
      { status: 500 }
    );
  }
}
