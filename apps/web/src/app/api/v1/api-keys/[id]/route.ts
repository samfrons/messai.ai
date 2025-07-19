import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { deleteApiKey, getApiKeyById } from '../../../../../lib/services/api-keys';

const paramsSchema = z.object({
  id: z.string().uuid(),
});

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Authentication required',
        },
        { status: 401 }
      );
    }

    // Validate params
    const validatedParams = paramsSchema.parse(params);

    // Get API key
    const apiKey = await getApiKeyById(validatedParams.id, session.user.id || 'demo-user');

    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'Not found',
          message: 'API key not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(apiKey);
  } catch (error) {
    console.error('Error fetching API key:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          message: 'Invalid API key ID format',
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'An error occurred while fetching the API key',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Authentication required',
        },
        { status: 401 }
      );
    }

    // Validate params
    const validatedParams = paramsSchema.parse(params);

    // Delete API key
    const deleted = await deleteApiKey(validatedParams.id, session.user.id || 'demo-user');

    if (!deleted) {
      return NextResponse.json(
        {
          error: 'Not found',
          message: 'API key not found',
        },
        { status: 404 }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting API key:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          message: 'Invalid API key ID format',
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'An error occurred while deleting the API key',
      },
      { status: 500 }
    );
  }
}
