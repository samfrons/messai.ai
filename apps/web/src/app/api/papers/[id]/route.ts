import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: Props) {
  try {
    const { id } = await params;

    const paper = await prisma.researchPaper.findUnique({
      where: { id },
      include: {
        uploadedBy: {
          select: { id: true, name: true, email: true },
        },
        tags: true,
        citations: {
          include: {
            citedPaper: {
              select: { id: true, title: true, authors: true, year: true },
            },
          },
        },
        citedBy: {
          include: {
            citingPaper: {
              select: { id: true, title: true, authors: true, year: true },
            },
          },
        },
        predictions: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    if (!paper) {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'Paper not found',
            code: 'NOT_FOUND',
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: paper,
      error: null,
    });
  } catch (error) {
    console.error('Paper detail API error:', error);
    return NextResponse.json(
      {
        data: null,
        error: {
          message: 'Failed to fetch paper',
          code: 'FETCH_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
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
      summary,
      keyFindings,
      performanceData,
      methodology,
      materials,
      qualityScore,
      verified,
    } = body;

    const paper = await prisma.researchPaper.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(abstract && { abstract }),
        ...(authors && { authors }),
        ...(journal && { journal }),
        ...(year && { year: parseInt(year) }),
        ...(doi && { doi }),
        ...(pmid && { pmid }),
        ...(arxivId && { arxivId }),
        ...(url && { url }),
        ...(pdfUrl && { pdfUrl }),
        ...(summary && { summary }),
        ...(keyFindings && { keyFindings }),
        ...(performanceData && { performanceData }),
        ...(methodology && { methodology }),
        ...(materials && { materials }),
        ...(qualityScore !== undefined && { qualityScore }),
        ...(verified !== undefined && { verified }),
        updatedAt: new Date(),
      },
      include: {
        uploadedBy: {
          select: { id: true, name: true, email: true },
        },
        tags: true,
      },
    });

    return NextResponse.json({
      data: paper,
      error: null,
    });
  } catch (error) {
    console.error('Paper update error:', error);

    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'Paper not found',
            code: 'NOT_FOUND',
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        data: null,
        error: {
          message: 'Failed to update paper',
          code: 'UPDATE_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: Props) {
  try {
    const { id } = await params;

    await prisma.researchPaper.delete({
      where: { id },
    });

    return NextResponse.json({
      data: { message: 'Paper deleted successfully' },
      error: null,
    });
  } catch (error) {
    console.error('Paper deletion error:', error);

    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'Paper not found',
            code: 'NOT_FOUND',
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        data: null,
        error: {
          message: 'Failed to delete paper',
          code: 'DELETE_ERROR',
        },
      },
      { status: 500 }
    );
  }
}
