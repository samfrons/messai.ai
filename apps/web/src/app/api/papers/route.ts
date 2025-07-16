import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';
import { transformDBPaperToResearchPaper } from '../../../services/paper-service';
import type { Prisma } from '@prisma/client';
import type { SortOption } from '../../research/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startTime = Date.now();

    // Parse pagination parameters
    const page = Math.max(0, parseInt(searchParams.get('page') || '0')); // 0-indexed for frontend
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '40')));
    const skip = page * limit;

    // Parse search parameters
    const search = searchParams.get('search') || '';
    const sortBy = (searchParams.get('sort') || 'relevance') as SortOption;

    // Parse filter parameters
    const yearStart = searchParams.get('yearStart')
      ? parseInt(searchParams.get('yearStart')!)
      : undefined;
    const yearEnd = searchParams.get('yearEnd')
      ? parseInt(searchParams.get('yearEnd')!)
      : undefined;
    const journalTypes = searchParams.get('journalTypes')?.split(',').filter(Boolean) || [];
    const researchFocus = searchParams.get('researchFocus')?.split(',').filter(Boolean) || [];
    const minCitations = searchParams.get('minCitations')
      ? parseInt(searchParams.get('minCitations')!)
      : undefined;
    const minQualityScore = searchParams.get('minQualityScore')
      ? parseFloat(searchParams.get('minQualityScore')!)
      : undefined;
    const minConfidenceScore = searchParams.get('minConfidenceScore')
      ? parseFloat(searchParams.get('minConfidenceScore')!)
      : undefined;
    const hasMetrics = searchParams.get('hasMetrics') === 'true';
    const verified = searchParams.get('verified') === 'true';
    const fullTextOnly = searchParams.get('fullTextOnly') === 'true';

    // Build where clause
    const where: Prisma.PaperWhereInput = {};

    // Text search across multiple fields
    if (search.trim()) {
      const searchTerms = search
        .toLowerCase()
        .split(' ')
        .filter((term) => term.length > 0);

      where.OR = searchTerms.map((term) => ({
        OR: [
          { title: { contains: term, mode: 'insensitive' } },
          { abstract: { contains: term, mode: 'insensitive' } },
          { journal: { contains: term, mode: 'insensitive' } },
          // Note: Authors field search handled differently for JSON vs Array
        ],
      }));
    }

    // Year range filter
    if (yearStart !== undefined || yearEnd !== undefined) {
      where.year = {};
      if (yearStart !== undefined) where.year.gte = yearStart;
      if (yearEnd !== undefined) where.year.lte = yearEnd;
    }

    // Citation count filter
    if (minCitations !== undefined) {
      where.citationCount = { gte: minCitations };
    }

    // Quality score filter
    if (minQualityScore !== undefined) {
      where.qualityScore = { gte: minQualityScore };
    }

    // Verified papers filter
    if (verified) {
      where.verified = true;
    }

    // Full text availability filter
    if (fullTextOnly) {
      where.pdfUrl = { not: null };
    }

    // Performance metrics filter (requires post-processing due to JSON field)
    // This will be handled after database query

    // Build order by clause
    const orderBy: Prisma.PaperOrderByWithRelationInput[] = [];

    switch (sortBy) {
      case 'year-desc':
        orderBy.push({ year: 'desc' });
        break;
      case 'year-asc':
        orderBy.push({ year: 'asc' });
        break;
      case 'citations-desc':
        orderBy.push({ citationCount: 'desc' });
        break;
      case 'citations-asc':
        orderBy.push({ citationCount: 'asc' });
        break;
      case 'quality-desc':
        orderBy.push({ qualityScore: 'desc' });
        break;
      case 'quality-asc':
        orderBy.push({ qualityScore: 'asc' });
        break;
      case 'added-desc':
        orderBy.push({ createdAt: 'desc' });
        break;
      case 'confidence-desc':
        orderBy.push({ qualityScore: 'desc' }); // Use qualityScore as proxy for confidence
        break;
      case 'relevance':
      default:
        // For relevance, we'll sort by a combination of factors
        orderBy.push({ qualityScore: 'desc' }, { citationCount: 'desc' }, { year: 'desc' });
        break;
    }

    // Execute database queries
    const [dbPapers, total] = await Promise.all([
      prisma.paper.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          uploadedBy: {
            select: { id: true, name: true },
          },
          tags: true,
          _count: {
            select: { citations: true, citedBy: true },
          },
        },
      }),
      prisma.paper.count({ where }),
    ]);

    // Transform database papers to frontend format
    let transformedPapers = dbPapers.map(transformDBPaperToResearchPaper);

    // Apply post-database filters that require JSON parsing
    if (hasMetrics) {
      transformedPapers = transformedPapers.filter(
        (paper) =>
          paper.performanceMetrics &&
          (paper.performanceMetrics.maxPowerDensity ||
            paper.performanceMetrics.coulombicEfficiency ||
            paper.performanceMetrics.energyRecoveryEfficiency)
      );
    }

    if (minConfidenceScore !== undefined) {
      transformedPapers = transformedPapers.filter(
        (paper) => (paper.aiConfidenceScore || 0) >= minConfidenceScore
      );
    }

    // Filter by research focus (using inferred values)
    if (researchFocus.length > 0) {
      transformedPapers = transformedPapers.filter((paper) =>
        paper.researchFocus.some((focus) => researchFocus.includes(focus))
      );
    }

    // Apply additional text search to author names (post-transformation)
    if (search.trim()) {
      const searchTerms = search
        .toLowerCase()
        .split(' ')
        .filter((term) => term.length > 0);
      transformedPapers = transformedPapers.filter((paper) => {
        const authorText = paper.authors
          .map((a) => a.name)
          .join(' ')
          .toLowerCase();
        return (
          searchTerms.some((term) => authorText.includes(term)) ||
          searchTerms.some(
            (term) =>
              paper.title.toLowerCase().includes(term) ||
              paper.abstract.toLowerCase().includes(term) ||
              paper.journal.name.toLowerCase().includes(term)
          )
        );
      });
    }

    // Calculate relevance scores for relevance sorting
    if (sortBy === 'relevance' && search.trim()) {
      const searchTerms = search
        .toLowerCase()
        .split(' ')
        .filter((term) => term.length > 0);

      transformedPapers = transformedPapers
        .map((paper) => {
          let relevanceScore = 0;
          const title = paper.title.toLowerCase();
          const abstract = paper.abstract.toLowerCase();
          const authorText = paper.authors
            .map((a) => a.name)
            .join(' ')
            .toLowerCase();

          searchTerms.forEach((term) => {
            // Title matches get highest score
            if (title.includes(term)) relevanceScore += 3;
            // Abstract matches get medium score
            if (abstract.includes(term)) relevanceScore += 2;
            // Author matches get base score
            if (authorText.includes(term)) relevanceScore += 1;
          });

          // Boost by quality metrics
          relevanceScore *= 1 + paper.qualityScore / 100;
          relevanceScore *= 1 + Math.log10(paper.citation.citationCount + 1) / 10;

          return { ...paper, relevanceScore };
        })
        .sort((a, b) => {
          const aScore = (a as any).relevanceScore || 0;
          const bScore = (b as any).relevanceScore || 0;
          return bScore - aScore;
        });
    }

    // Generate search suggestions
    const suggestions = search.trim() ? generateSuggestions(search) : undefined;

    const searchTime = Date.now() - startTime;

    return NextResponse.json({
      data: {
        papers: transformedPapers,
        pagination: {
          page,
          limit,
          total: transformedPapers.length, // Use filtered count
          pages: Math.ceil(transformedPapers.length / limit),
        },
        searchTime,
        suggestions,
      },
      error: null,
    });
  } catch (error) {
    console.error('Papers API error:', error);
    return NextResponse.json(
      {
        data: null,
        error: {
          message: 'Failed to fetch papers',
          code: 'FETCH_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * Generate search suggestions based on query
 */
function generateSuggestions(query: string): string[] {
  const lowerQuery = query.toLowerCase();
  const suggestions: string[] = [];

  // Common research terms
  const commonTerms = [
    'microbial fuel cell',
    'electrode design',
    'biofilm engineering',
    'power density',
    'coulombic efficiency',
    'energy recovery',
    'wastewater treatment',
    'hydrogen production',
    'performance optimization',
    'materials science',
    'graphene',
    'bioelectrochemical',
    'electrolysis',
    'desalination',
    'proton exchange membrane',
    'solid oxide fuel cell',
  ];

  // Add matching terms
  commonTerms.forEach((term) => {
    if (term.includes(lowerQuery) && !suggestions.includes(term)) {
      suggestions.push(term);
    }
  });

  return suggestions.slice(0, 5);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      title,
      abstract,
      authors,
      journal,
      year,
      doi,
      pmid,
      arxivId,
      url,
      pdfUrl,
      uploadedById,
    } = body;

    if (!title || !abstract || !authors || !year) {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'Missing required fields: title, abstract, authors, year',
            code: 'VALIDATION_ERROR',
          },
        },
        { status: 400 }
      );
    }

    const paper = await prisma.paper.create({
      data: {
        title,
        abstract,
        authors,
        journal,
        year: parseInt(year),
        doi,
        pmid,
        arxivId,
        url,
        pdfUrl,
        uploadedById,
        processingStatus: 'pending',
      },
      include: {
        uploadedBy: {
          select: { id: true, name: true, email: true },
        },
        tags: true,
      },
    });

    return NextResponse.json(
      {
        data: paper,
        error: null,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Papers creation error:', error);

    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'Paper with this DOI/PMID already exists',
            code: 'DUPLICATE_ERROR',
          },
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        data: null,
        error: {
          message: 'Failed to create paper',
          code: 'CREATION_ERROR',
        },
      },
      { status: 500 }
    );
  }
}
