import * as schemas from './schemas';

export interface OpenAPIDocument {
  openapi: string;
  info: {
    title: string;
    version: string;
    description: string;
    contact?: {
      name: string;
      email: string;
      url: string;
    };
    license?: {
      name: string;
      url: string;
    };
  };
  servers: Array<{
    url: string;
    description: string;
  }>;
  tags: Array<{
    name: string;
    description: string;
  }>;
  paths: Record<string, any>;
  components: {
    securitySchemes: Record<string, any>;
    schemas?: Record<string, any>;
  };
}

// Generate OpenAPI document
export function generateOpenAPIDocument(): OpenAPIDocument {
  return {
    openapi: '3.1.0',
    info: {
      title: 'MESSAI API',
      version: '1.0.0',
      description: `
# MESSAI Research Platform API

Welcome to the MESSAI API documentation. This API provides access to our comprehensive database of microbial electrochemical systems research papers and related data.

## Authentication

The API supports two authentication methods:

1. **API Key**: Include your API key in the \`X-API-Key\` header
2. **Bearer Token**: Include your JWT token in the \`Authorization: Bearer <token>\` header

## Rate Limiting

Rate limits are applied based on your authentication tier:
- **Anonymous**: 100 requests per 15 minutes
- **Authenticated**: 1,000 requests per 15 minutes  
- **Premium**: 10,000 requests per 15 minutes

## Versioning

The API uses URL path versioning. Always include the version in your requests:
- Current version: \`v1\`
- Example: \`/api/v1/papers\`

## Response Format

All responses follow a consistent format:

\`\`\`json
{
  "data": { ... },
  "error": null
}
\`\`\`

## Error Handling

Errors are returned with appropriate HTTP status codes and error details:

\`\`\`json
{
  "error": "Error type",
  "message": "Human-readable error message",
  "details": { ... }
}
\`\`\`
      `.trim(),
      contact: {
        name: 'MESSAI Support',
        email: 'support@messai.ai',
        url: 'https://messai.ai',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'https://messai.ai',
        description: 'Production server',
      },
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    tags: [
      {
        name: 'Papers',
        description: 'Research paper operations',
      },
      {
        name: 'API Keys',
        description: 'API key management',
      },
      {
        name: 'Rate Limiting',
        description: 'Rate limit information',
      },
      {
        name: 'Webhooks',
        description: 'Webhook management',
      },
      {
        name: 'Usage',
        description: 'Usage statistics and analytics',
      },
    ],
    paths: {
      '/api/v1/papers': {
        get: {
          summary: 'Get research papers',
          description: 'Search and retrieve research papers with filtering and pagination',
          tags: ['Papers'],
          parameters: [
            {
              name: 'search',
              in: 'query',
              description: 'Search query for papers',
              required: false,
              schema: { type: 'string' },
            },
            {
              name: 'systemType',
              in: 'query',
              description: 'Filter by system type',
              required: false,
              schema: {
                type: 'string',
                enum: ['MFC', 'BES', 'MEC', 'MES', 'MDC'],
              },
            },
            {
              name: 'yearStart',
              in: 'query',
              description: 'Filter by start year',
              required: false,
              schema: { type: 'integer', minimum: 1900, maximum: 2100 },
            },
            {
              name: 'yearEnd',
              in: 'query',
              description: 'Filter by end year',
              required: false,
              schema: { type: 'integer', minimum: 1900, maximum: 2100 },
            },
            {
              name: 'qualityScoreMin',
              in: 'query',
              description: 'Minimum quality score',
              required: false,
              schema: { type: 'number', minimum: 0, maximum: 100 },
            },
            {
              name: 'sort',
              in: 'query',
              description: 'Sort order',
              required: false,
              schema: {
                type: 'string',
                enum: ['relevance', 'date', 'quality', 'citations'],
                default: 'relevance',
              },
            },
            {
              name: 'page',
              in: 'query',
              description: 'Page number',
              required: false,
              schema: { type: 'integer', minimum: 1, default: 1 },
            },
            {
              name: 'limit',
              in: 'query',
              description: 'Items per page',
              required: false,
              schema: { type: 'integer', minimum: 1, maximum: 100, default: 40 },
            },
          ],
          responses: {
            '200': {
              description: 'Successful response',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/PapersResponse',
                  },
                  examples: {
                    success: {
                      value: {
                        data: {
                          papers: [
                            {
                              id: '123e4567-e89b-12d3-a456-426614174000',
                              title: 'Advances in Microbial Fuel Cell Technology',
                              abstract: 'This study presents novel findings...',
                              authors: ['John Doe', 'Jane Smith'],
                              publicationDate: '2024-01-15T00:00:00Z',
                              year: 2024,
                              url: 'https://example.com/paper.pdf',
                              pdfUrl: 'https://example.com/paper.pdf',
                              systemType: 'MFC',
                              qualityScore: 85,
                              citationCount: 42,
                              verified: true,
                              tags: ['bioelectrochemistry', 'renewable energy'],
                            },
                          ],
                          pagination: {
                            page: 1,
                            limit: 40,
                            total: 1000,
                            pages: 25,
                          },
                          stats: {
                            totalResults: 1000,
                            systemTypes: {
                              MFC: 677,
                              BES: 184,
                              MEC: 116,
                              MES: 33,
                              MDC: 9,
                            },
                            yearRange: {
                              min: 2000,
                              max: 2024,
                            },
                          },
                          searchTime: 0.123,
                        },
                        error: null,
                      },
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Bad request',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            '429': {
              description: 'Rate limit exceeded',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/api/v1/papers/{id}': {
        get: {
          summary: 'Get paper by ID',
          description: 'Retrieve a specific research paper by its ID',
          tags: ['Papers'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              description: 'Paper ID',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          responses: {
            '200': {
              description: 'Successful response',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ResearchPaper' },
                },
              },
            },
            '404': {
              description: 'Paper not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/api/v1/rate-limit': {
        get: {
          summary: 'Get rate limit info',
          description: 'Get current rate limit status for the authenticated user',
          tags: ['Rate Limiting'],
          security: [{ apiKey: [] }, { bearerAuth: [] }],
          responses: {
            '200': {
              description: 'Rate limit information',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/RateLimitInfo' },
                },
              },
            },
          },
        },
      },
      '/api/v1/api-keys': {
        get: {
          summary: 'List API keys',
          description: 'List all API keys for the authenticated user',
          tags: ['API Keys'],
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'List of API keys',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/ApiKey' },
                  },
                },
              },
            },
          },
        },
        post: {
          summary: 'Create API key',
          description: 'Create a new API key',
          tags: ['API Keys'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateApiKey' },
              },
            },
          },
          responses: {
            '201': {
              description: 'API key created',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiKey' },
                },
              },
            },
            '400': {
              description: 'Bad request',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/api/v1/api-keys/{id}': {
        delete: {
          summary: 'Delete API key',
          description: 'Delete an API key',
          tags: ['API Keys'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              description: 'API Key ID',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          responses: {
            '204': {
              description: 'API key deleted',
            },
            '404': {
              description: 'API key not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/api/v1/webhooks': {
        get: {
          summary: 'List webhooks',
          description: 'List all webhooks for the authenticated user',
          tags: ['Webhooks'],
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'List of webhooks',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Webhook' },
                  },
                },
              },
            },
          },
        },
        post: {
          summary: 'Create webhook',
          description: 'Create a new webhook',
          tags: ['Webhooks'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateWebhook' },
              },
            },
          },
          responses: {
            '201': {
              description: 'Webhook created',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Webhook' },
                },
              },
            },
          },
        },
      },
      '/api/v1/usage': {
        get: {
          summary: 'Get usage stats',
          description: 'Get API usage statistics',
          tags: ['Usage'],
          security: [{ apiKey: [] }, { bearerAuth: [] }],
          parameters: [
            {
              name: 'period',
              in: 'query',
              description: 'Time period for statistics',
              required: false,
              schema: {
                type: 'string',
                enum: ['hour', 'day', 'week', 'month'],
                default: 'day',
              },
            },
          ],
          responses: {
            '200': {
              description: 'Usage statistics',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/UsageStats' },
                },
              },
            },
          },
        },
      },
    },
    components: {
      securitySchemes: {
        apiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API key for authentication',
        },
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token for authentication',
        },
      },
      schemas: {
        ErrorResponse: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
            details: { type: 'object' },
          },
          required: ['error', 'message'],
        },
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer' },
            limit: { type: 'integer' },
            total: { type: 'integer' },
            pages: { type: 'integer' },
          },
          required: ['page', 'limit', 'total', 'pages'],
        },
        ResearchPaper: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            abstract: { type: 'string' },
            authors: { type: 'array', items: { type: 'string' } },
            publicationDate: { type: 'string', format: 'date-time' },
            year: { type: 'integer' },
            url: { type: 'string', format: 'uri', nullable: true },
            pdfUrl: { type: 'string', format: 'uri', nullable: true },
            systemType: { type: 'string', enum: ['MFC', 'BES', 'MEC', 'MES', 'MDC'] },
            qualityScore: { type: 'number', minimum: 0, maximum: 100 },
            citationCount: { type: 'integer', minimum: 0 },
            verified: { type: 'boolean' },
            tags: { type: 'array', items: { type: 'string' } },
            metadata: { type: 'object' },
          },
          required: [
            'id',
            'title',
            'abstract',
            'authors',
            'publicationDate',
            'year',
            'systemType',
            'qualityScore',
            'citationCount',
            'verified',
            'tags',
          ],
        },
        PapersResponse: {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              properties: {
                papers: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/ResearchPaper' },
                },
                pagination: { $ref: '#/components/schemas/Pagination' },
                stats: {
                  type: 'object',
                  properties: {
                    totalResults: { type: 'integer' },
                    systemTypes: { type: 'object' },
                    yearRange: {
                      type: 'object',
                      properties: {
                        min: { type: 'integer' },
                        max: { type: 'integer' },
                      },
                    },
                  },
                },
                searchTime: { type: 'number' },
                suggestions: { type: 'array', items: { type: 'string' } },
              },
            },
            error: { type: 'null' },
          },
        },
        ApiKey: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            key: { type: 'string' },
            name: { type: 'string' },
            tier: { type: 'string', enum: ['free', 'premium', 'enterprise'] },
            createdAt: { type: 'string', format: 'date-time' },
            lastUsedAt: { type: 'string', format: 'date-time', nullable: true },
            expiresAt: { type: 'string', format: 'date-time', nullable: true },
            permissions: { type: 'array', items: { type: 'string' } },
            rateLimit: {
              type: 'object',
              properties: {
                requests: { type: 'integer' },
                window: { type: 'string' },
              },
            },
          },
        },
        CreateApiKey: {
          type: 'object',
          properties: {
            name: { type: 'string', minLength: 3, maxLength: 100 },
            tier: { type: 'string', enum: ['free', 'premium', 'enterprise'], default: 'free' },
            permissions: { type: 'array', items: { type: 'string' }, default: ['read'] },
            expiresIn: { type: 'integer', description: 'Days until expiration' },
          },
          required: ['name'],
        },
        RateLimitInfo: {
          type: 'object',
          properties: {
            tier: { type: 'string', enum: ['anonymous', 'authenticated', 'premium'] },
            limit: { type: 'integer' },
            used: { type: 'integer' },
            remaining: { type: 'integer' },
            resetTime: { type: 'string', format: 'date-time' },
            windowMs: { type: 'integer' },
          },
        },
        Webhook: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            url: { type: 'string', format: 'uri' },
            events: { type: 'array', items: { type: 'string' } },
            secret: { type: 'string' },
            active: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            lastTriggeredAt: { type: 'string', format: 'date-time', nullable: true },
          },
        },
        CreateWebhook: {
          type: 'object',
          properties: {
            url: { type: 'string', format: 'uri' },
            events: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['paper.created', 'paper.updated', 'paper.deleted'],
              },
            },
            secret: { type: 'string' },
          },
          required: ['url', 'events'],
        },
        UsageStats: {
          type: 'object',
          properties: {
            period: {
              type: 'object',
              properties: {
                start: { type: 'string', format: 'date-time' },
                end: { type: 'string', format: 'date-time' },
              },
            },
            requests: {
              type: 'object',
              properties: {
                total: { type: 'integer' },
                successful: { type: 'integer' },
                failed: { type: 'integer' },
              },
            },
            endpoints: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  path: { type: 'string' },
                  method: { type: 'string' },
                  count: { type: 'integer' },
                  avgResponseTime: { type: 'number' },
                },
              },
            },
            quota: {
              type: 'object',
              properties: {
                limit: { type: 'integer' },
                used: { type: 'integer' },
                remaining: { type: 'integer' },
              },
            },
          },
        },
      },
    },
  };
}
