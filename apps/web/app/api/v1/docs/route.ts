/**
 * API Documentation Endpoint
 * Serves OpenAPI specification
 */

import { NextRequest } from 'next/server'
import { createApiHandler } from '../../../lib/api/middleware'
import { successResponse } from '../../../lib/api/response'
import { openApiSpec } from '../../../lib/api/openapi'

/**
 * GET /api/v1/docs
 * Returns the OpenAPI specification
 */
export const GET = createApiHandler(
  async (request: NextRequest, { apiContext }) => {
    return successResponse(openApiSpec, {
      correlationId: apiContext.correlationId,
      headers: {
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      }
    })
  },
  { requireAuth: false }
)