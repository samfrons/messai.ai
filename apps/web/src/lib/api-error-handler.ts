import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export interface ApiError {
  message: string;
  code: string;
  details?: any;
  statusCode?: number;
}

/**
 * Custom API Error class
 */
export class ApiException extends Error {
  constructor(
    public message: string,
    public code: string,
    public statusCode: number = 400,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiException';
  }
}

/**
 * Handle API errors consistently
 */
export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error);

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        data: null,
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code,
          })),
        },
      },
      { status: 400 }
    );
  }

  // Handle custom API exceptions
  if (error instanceof ApiException) {
    return NextResponse.json(
      {
        data: null,
        error: {
          message: error.message,
          code: error.code,
          details: error.details,
        },
      },
      { status: error.statusCode }
    );
  }

  // Handle Prisma errors
  if (error instanceof Error) {
    // Unique constraint violation
    if (error.message.includes('Unique constraint')) {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'Resource already exists',
            code: 'DUPLICATE_ERROR',
          },
        },
        { status: 409 }
      );
    }

    // Record not found
    if (
      error.message.includes('Record to update not found') ||
      error.message.includes('Record to delete does not exist')
    ) {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'Resource not found',
            code: 'NOT_FOUND',
          },
        },
        { status: 404 }
      );
    }

    // Database connection errors
    if (error.message.includes('P1001') || error.message.includes('connect')) {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'Database connection error',
            code: 'DATABASE_ERROR',
          },
        },
        { status: 503 }
      );
    }
  }

  // Default error response
  return NextResponse.json(
    {
      data: null,
      error: {
        message: 'An unexpected error occurred',
        code: 'INTERNAL_ERROR',
      },
    },
    { status: 500 }
  );
}

/**
 * Wrap API route handler with error handling
 */
export function withErrorHandler<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error);
    }
  }) as T;
}

/**
 * Assert condition or throw API exception
 */
export function assert(
  condition: any,
  message: string,
  code: string,
  statusCode: number = 400
): asserts condition {
  if (!condition) {
    throw new ApiException(message, code, statusCode);
  }
}

/**
 * Common API response builders
 */
export const ApiResponse = {
  success<T>(data: T, meta?: any): NextResponse {
    return NextResponse.json({
      data,
      error: null,
      ...(meta && { meta }),
    });
  },

  created<T>(data: T): NextResponse {
    return NextResponse.json(
      {
        data,
        error: null,
      },
      { status: 201 }
    );
  },

  noContent(): NextResponse {
    return new NextResponse(null, { status: 204 });
  },

  error(error: ApiError): NextResponse {
    return NextResponse.json(
      {
        data: null,
        error: {
          message: error.message,
          code: error.code,
          details: error.details,
        },
      },
      { status: error.statusCode || 400 }
    );
  },
};
