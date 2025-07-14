import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: Props) {
  try {
    const { id } = await params;

    const prediction = await prisma.prediction.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        paper: {
          select: {
            id: true,
            title: true,
            authors: true,
            year: true,
            abstract: true,
            performanceData: true,
          },
        },
      },
    });

    if (!prediction) {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'Prediction not found',
            code: 'NOT_FOUND',
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: prediction,
      error: null,
    });
  } catch (error) {
    console.error('Prediction detail API error:', error);
    return NextResponse.json(
      {
        data: null,
        error: {
          message: 'Failed to fetch prediction',
          code: 'FETCH_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: Props) {
  try {
    const { id } = await params;

    await prisma.prediction.delete({
      where: { id },
    });

    return NextResponse.json({
      data: { message: 'Prediction deleted successfully' },
      error: null,
    });
  } catch (error) {
    console.error('Prediction deletion error:', error);

    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'Prediction not found',
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
          message: 'Failed to delete prediction',
          code: 'DELETE_ERROR',
        },
      },
      { status: 500 }
    );
  }
}
