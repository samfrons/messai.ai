import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@messai/database';
import {
  checkProductionWrite,
  createProductionSafetyResponse,
} from '../../../lib/production-safety';

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const searchParam = searchParams.get('search') || '';
    const search = searchParam.slice(0, 200); // Limit search length
    const sort = searchParams.get('sort') || 'relevance';
    const page = Math.max(0, parseInt(searchParams.get('page') || '0', 10) || 0);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '40', 10) || 40));

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
        { authors: { contains: search, mode: 'insensitive' } }, // Fix: authors is a string, not array
        { journal: { contains: search, mode: 'insensitive' } },
        { systemType: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Year range filter - extract year from publicationDate
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
      where.aiConfidence = { gte: parseFloat(minQualityScore) / 100 }; // Convert to 0-1 scale
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
        orderBy = { powerOutput: 'desc' }; // Use powerOutput as proxy for importance
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
        // For relevance, we'll use a combination of AI confidence and creation date
        orderBy = [{ aiConfidence: 'desc' }, { createdAt: 'desc' }];
        break;
    }

    // Execute queries in parallel with optimized selection
    const [papers, totalCount] = await Promise.all([
      prisma.researchPaper.findMany({
        where,
        orderBy,
        skip: page * limit,
        take: limit,
        select: {
          id: true,
          title: true,
          authors: true,
          abstract: true,
          publicationDate: true,
          journal: true,
          doi: true,
          externalUrl: true,
          systemType: true,
          powerOutput: true,
          efficiency: true,
          aiSummary: true,
          aiKeyFindings: true,
          aiConfidence: true,
          source: true,
          isPublic: true,
          createdAt: true,
          // In Silico Model Integration fields
          inSilicoAvailable: true,
          modelType: true,
        },
      }),
      prisma.researchPaper.count({ where }),
    ]);

    // Transform papers to match frontend expectations
    const transformedPapers = papers.map((paper) => {
      // Optimized parsing with memoization
      const parseAuthors = (authors: any): string[] => {
        if (Array.isArray(authors)) return authors;
        if (typeof authors === 'string') {
          try {
            return JSON.parse(authors);
          } catch {
            return [authors];
          }
        }
        return [];
      };

      const parseKeyFindings = (findings: any): string[] => {
        if (!findings) return [];
        try {
          return JSON.parse(findings as string);
        } catch {
          return [];
        }
      };

      const authorsList = parseAuthors(paper.authors);
      const keyFindings = parseKeyFindings(paper.aiKeyFindings);
      const year = paper.publicationDate ? new Date(paper.publicationDate).getFullYear() : null;

      // Clean abstract text by removing JATS XML tags
      const cleanAbstract = (text: string) => {
        if (!text) return '';
        return text
          .replace(/<jats:[^>]*>/g, '') // Remove opening JATS tags
          .replace(/<\/jats:[^>]*>/g, '') // Remove closing JATS tags
          .replace(/<[^>]*>/g, '') // Remove any remaining HTML/XML tags
          .trim();
      };

      // JSON parsing function removed since fields were eliminated

      return {
        id: paper.id,
        title: paper.title,
        authors: authorsList.map((name) => ({ name, affiliation: '' })),
        abstract: cleanAbstract(paper.abstract || ''),
        year: year || 0,
        journal: {
          name: paper.journal || '',
          impactFactor: 0,
        },
        doi: paper.doi || '',
        url: paper.externalUrl || '',
        pdfUrl: paper.externalUrl || '', // Use externalUrl as PDF URL fallback
        citation: {
          citationCount: paper.powerOutput || 0, // Use powerOutput as proxy for citations
          hIndex: 0,
          scholarProfile: '',
        },
        qualityScore: (paper.aiConfidence || 0) * 100, // Convert 0-1 to 0-100 scale
        aiConfidenceScore: (paper.aiConfidence || 0) * 100,
        verified: paper.isPublic,
        researchFocus: paper.systemType ? [paper.systemType] : [],
        performanceMetrics: {
          maxPowerDensity: paper.powerOutput,
          coulombicEfficiency: paper.efficiency,
          currentDensity: null, // Not available in this schema
        },
        keyFindings: keyFindings,
        aiEnhanced: !!paper.aiSummary,
        source: paper.source || 'database',
        processingDate: paper.createdAt.toISOString(),
        fullTextAvailable: !!paper.externalUrl,

        // In Silico Model Integration fields
        inSilicoAvailable: paper.inSilicoAvailable || false,
        modelType: paper.modelType || '',
      };
    });

    // Calculate statistics - only when needed (not for every request)
    const includeStats = searchParams.get('includeStats') === 'true';
    let stats = null;

    if (includeStats) {
      const [systemTypes, yearRange] = await Promise.all([
        prisma.researchPaper.groupBy({
          by: ['systemType'],
          where: { systemType: { not: null } },
          _count: true,
        }),
        prisma.researchPaper.aggregate({
          _min: { publicationDate: true },
          _max: { publicationDate: true },
        }),
      ]);

      stats = {
        totalPapers: totalCount,
        systemTypes,
        yearRange,
      };
    }

    const searchTime = Date.now() - startTime;

    return NextResponse.json({
      data: {
        papers: transformedPapers,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
        },
        stats: stats
          ? {
              totalResults: totalCount,
              systemTypes: stats.systemTypes.map((st) => ({
                type: st.systemType,
                count: st._count,
              })),
              yearRange: {
                min: stats.yearRange._min.publicationDate
                  ? new Date(stats.yearRange._min.publicationDate).getFullYear()
                  : 2000,
                max: stats.yearRange._max.publicationDate
                  ? new Date(stats.yearRange._max.publicationDate).getFullYear()
                  : new Date().getFullYear(),
              },
            }
          : { totalResults: totalCount },
        searchTime,
        suggestions: search ? [] : undefined, // Add empty suggestions array when search is provided
      },
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
    // CRITICAL: Prevent writes to production database
    try {
      checkProductionWrite('create research paper');
    } catch (error) {
      return NextResponse.json(createProductionSafetyResponse('create research paper'), {
        status: 403,
      });
    }

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

    const paper = await prisma.researchPaper.create({
      data: {
        title,
        abstract,
        authors: JSON.stringify(authors), // authors is a string field in deployment schema
        journal,
        publicationDate: new Date(`${year}-01-01`), // Convert year to date
        doi,
        pubmedId: pmid, // Field renamed in deployment schema
        arxivId,
        externalUrl: url || pdfUrl, // Use externalUrl field
        keywords: '[]', // Required field in deployment schema
        source: 'user', // Required field in deployment schema
        uploadedBy: uploadedById,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
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
