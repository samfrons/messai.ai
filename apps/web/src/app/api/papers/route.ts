import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const year = searchParams.get('year');
    const journal = searchParams.get('journal');
    const verified = searchParams.get('verified');

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { abstract: { contains: search, mode: 'insensitive' } },
        { authors: { has: search } },
      ];
    }

    if (year) {
      where.year = parseInt(year);
    }

    if (journal) {
      where.journal = { contains: journal, mode: 'insensitive' };
    }

    if (verified === 'true') {
      where.verified = true;
    }

    const [papers, total] = await Promise.all([
      prisma.researchPaper.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ qualityScore: 'desc' }, { year: 'desc' }, { citationCount: 'desc' }],
        include: {
          uploadedBy: {
            select: { id: true, name: true, email: true },
          },
          tags: true,
          _count: {
            select: { citations: true, citedBy: true },
          },
        },
      }),
      prisma.researchPaper.count({ where }),
    ]);

    return NextResponse.json({
      data: {
        papers,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
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

    const paper = await prisma.researchPaper.create({
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
