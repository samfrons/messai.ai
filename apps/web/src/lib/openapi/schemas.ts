import { z } from 'zod';
import { extendZodWithOpenApi } from 'zod-to-openapi';

// Extend Zod with OpenAPI support
extendZodWithOpenApi(z);

// Common schemas
export const ErrorResponseSchema = z
  .object({
    error: z.string(),
    message: z.string(),
    details: z.any().optional(),
  })
  .openapi('ErrorResponse');

export const PaginationSchema = z
  .object({
    page: z.number().int().positive(),
    limit: z.number().int().positive().max(100),
    total: z.number().int().nonnegative(),
    pages: z.number().int().nonnegative(),
  })
  .openapi('Pagination');

export const ApiVersionSchema = z.enum(['v1', 'v2']).openapi('ApiVersion');

// Research Paper schemas
export const ResearchPaperSchema = z
  .object({
    id: z.string().uuid(),
    title: z.string(),
    abstract: z.string(),
    authors: z.array(z.string()),
    publicationDate: z.string().datetime(),
    year: z.number().int(),
    url: z.string().url().nullable(),
    pdfUrl: z.string().url().nullable(),
    systemType: z.enum(['MFC', 'BES', 'MEC', 'MES', 'MDC']),
    qualityScore: z.number().min(0).max(100),
    citationCount: z.number().int().nonnegative(),
    verified: z.boolean(),
    tags: z.array(z.string()),
    metadata: z.record(z.any()).optional(),
  })
  .openapi('ResearchPaper');

export const PapersQuerySchema = z
  .object({
    search: z.string().optional(),
    systemType: z.enum(['MFC', 'BES', 'MEC', 'MES', 'MDC']).optional(),
    yearStart: z.number().int().min(1900).max(2100).optional(),
    yearEnd: z.number().int().min(1900).max(2100).optional(),
    qualityScoreMin: z.number().min(0).max(100).optional(),
    sort: z.enum(['relevance', 'date', 'quality', 'citations']).default('relevance'),
    page: z.number().int().positive().default(1),
    limit: z.number().int().positive().max(100).default(40),
    verified: z.boolean().optional(),
  })
  .openapi('PapersQuery');

export const PapersResponseSchema = z
  .object({
    data: z.object({
      papers: z.array(ResearchPaperSchema),
      pagination: PaginationSchema,
      stats: z.object({
        totalResults: z.number().int(),
        systemTypes: z.record(z.number()),
        yearRange: z.object({
          min: z.number().int(),
          max: z.number().int(),
        }),
      }),
      searchTime: z.number(),
      suggestions: z.array(z.string()).optional(),
    }),
    error: z.null(),
  })
  .openapi('PapersResponse');

// API Key schemas
export const ApiKeySchema = z
  .object({
    id: z.string().uuid(),
    key: z.string(),
    name: z.string(),
    tier: z.enum(['free', 'premium', 'enterprise']),
    createdAt: z.string().datetime(),
    lastUsedAt: z.string().datetime().nullable(),
    expiresAt: z.string().datetime().nullable(),
    permissions: z.array(z.string()),
    rateLimit: z.object({
      requests: z.number().int(),
      window: z.string(),
    }),
  })
  .openapi('ApiKey');

export const CreateApiKeySchema = z
  .object({
    name: z.string().min(3).max(100),
    tier: z.enum(['free', 'premium', 'enterprise']).default('free'),
    permissions: z.array(z.string()).default(['read']),
    expiresIn: z.number().int().positive().optional(), // Days
  })
  .openapi('CreateApiKey');

// Rate Limit schemas
export const RateLimitInfoSchema = z
  .object({
    tier: z.enum(['anonymous', 'authenticated', 'premium']),
    limit: z.number().int(),
    used: z.number().int(),
    remaining: z.number().int(),
    resetTime: z.string().datetime(),
    windowMs: z.number().int(),
  })
  .openapi('RateLimitInfo');

// Webhook schemas
export const WebhookSchema = z
  .object({
    id: z.string().uuid(),
    url: z.string().url(),
    events: z.array(z.string()),
    secret: z.string(),
    active: z.boolean(),
    createdAt: z.string().datetime(),
    lastTriggeredAt: z.string().datetime().nullable(),
  })
  .openapi('Webhook');

export const CreateWebhookSchema = z
  .object({
    url: z.string().url(),
    events: z.array(z.enum(['paper.created', 'paper.updated', 'paper.deleted'])),
    secret: z.string().optional(),
  })
  .openapi('CreateWebhook');

// Usage Analytics schemas
export const UsageStatsSchema = z
  .object({
    period: z.object({
      start: z.string().datetime(),
      end: z.string().datetime(),
    }),
    requests: z.object({
      total: z.number().int(),
      successful: z.number().int(),
      failed: z.number().int(),
    }),
    endpoints: z.array(
      z.object({
        path: z.string(),
        method: z.string(),
        count: z.number().int(),
        avgResponseTime: z.number(),
      })
    ),
    quota: z.object({
      limit: z.number().int(),
      used: z.number().int(),
      remaining: z.number().int(),
    }),
  })
  .openapi('UsageStats');
