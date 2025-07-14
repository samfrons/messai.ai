import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const userId = searchParams.get('userId');
    const systemType = searchParams.get('systemType');

    const skip = (page - 1) * limit;

    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (systemType) {
      where.systemType = systemType;
    }

    const [predictions, total] = await Promise.all([
      prisma.prediction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          paper: {
            select: { id: true, title: true, authors: true, year: true },
          },
        },
      }),
      prisma.prediction.count({ where }),
    ]);

    return NextResponse.json({
      data: {
        predictions,
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
    console.error('Predictions API error:', error);
    return NextResponse.json(
      {
        data: null,
        error: {
          message: 'Failed to fetch predictions',
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
      userId,
      systemType,
      configuration,
      powerOutput,
      currentDensity,
      voltage,
      efficiency,
      coulombicEff,
      optimizedParams,
      improvements,
      modelVersion,
      confidence,
      computeTime,
      paperId,
    } = body;

    if (!userId || !systemType || !configuration) {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'Missing required fields: userId, systemType, configuration',
            code: 'VALIDATION_ERROR',
          },
        },
        { status: 400 }
      );
    }

    const prediction = await prisma.prediction.create({
      data: {
        userId,
        systemType,
        configuration,
        powerOutput,
        currentDensity,
        voltage,
        efficiency,
        coulombicEff,
        optimizedParams,
        improvements,
        modelVersion: modelVersion || 'v1.0',
        confidence,
        computeTime,
        paperId,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        paper: {
          select: { id: true, title: true, authors: true, year: true },
        },
      },
    });

    return NextResponse.json(
      {
        data: prediction,
        error: null,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Prediction creation error:', error);
    return NextResponse.json(
      {
        data: null,
        error: {
          message: 'Failed to create prediction',
          code: 'CREATION_ERROR',
        },
      },
      { status: 500 }
    );
  }
}
