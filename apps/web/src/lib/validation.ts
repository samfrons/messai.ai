import { z } from 'zod';

// Common validation schemas
export const paginationSchema = z.object({
  page: z.coerce.number().min(0).default(0),
  limit: z.coerce.number().min(1).max(100).default(40),
});

export const searchSchema = z.object({
  search: z.string().max(200).optional(),
  sort: z
    .enum([
      'relevance',
      'date',
      'year-desc',
      'year-asc',
      'citations',
      'citations-desc',
      'citations-asc',
      'quality',
      'quality-desc',
      'quality-asc',
      'added-desc',
    ])
    .optional()
    .default('relevance'),
});

export const paperFiltersSchema = z
  .object({
    yearStart: z.coerce.number().min(1900).max(new Date().getFullYear()).optional(),
    yearEnd: z.coerce.number().min(1900).max(new Date().getFullYear()).optional(),
    minCitations: z.coerce.number().min(0).optional(),
    minQualityScore: z.coerce.number().min(0).max(100).optional(),
    hasMetrics: z.coerce.boolean().optional(),
    verified: z.coerce.boolean().optional(),
    includeStats: z.coerce.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.yearStart && data.yearEnd) {
        return data.yearStart <= data.yearEnd;
      }
      return true;
    },
    {
      message: 'yearStart must be less than or equal to yearEnd',
    }
  );

// Paper creation/update schemas
export const createPaperSchema = z.object({
  title: z.string().min(1).max(500),
  abstract: z.string().min(1).max(5000),
  authors: z.array(z.string()).min(1),
  journal: z.string().min(1).max(200),
  year: z.number().min(1900).max(new Date().getFullYear()),
  doi: z
    .string()
    .regex(/^10\.\d{4,}\/[-._;()\/:a-zA-Z0-9]+$/)
    .optional(),
  pmid: z.string().regex(/^\d+$/).optional(),
  arxivId: z
    .string()
    .regex(/^\d{4}\.\d{4,5}$/)
    .optional(),
  url: z.string().url().optional(),
  pdfUrl: z.string().url().optional(),
  uploadedById: z.string().uuid(),
});

export const updatePaperSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  abstract: z.string().min(1).max(5000).optional(),
  authors: z.array(z.string()).min(1).optional(),
  journal: z.string().min(1).max(200).optional(),
  year: z.number().min(1900).max(new Date().getFullYear()).optional(),
  doi: z
    .string()
    .regex(/^10\.\d{4,}\/[-._;()\/:a-zA-Z0-9]+$/)
    .optional(),
  pmid: z.string().regex(/^\d+$/).optional(),
  arxivId: z
    .string()
    .regex(/^\d{4}\.\d{4,5}$/)
    .optional(),
  url: z.string().url().optional(),
  pdfUrl: z.string().url().optional(),
  summary: z.string().max(2000).optional(),
  keyFindings: z.array(z.string()).optional(),
  performanceData: z.record(z.any()).optional(),
  methodology: z.string().optional(),
  materials: z.string().optional(),
  qualityScore: z.number().min(0).max(100).optional(),
  verified: z.boolean().optional(),
});

// ID validation
export const idSchema = z.string().uuid();

// Experiment schemas
export const createExperimentSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  systemType: z.enum(['MFC', 'MEC', 'MDC', 'BES', 'MES']),
  configuration: z
    .object({
      anodeMaterial: z.string().optional(),
      cathodeMaterial: z.string().optional(),
      membraneType: z.string().optional(),
      reactorVolume: z.number().positive().optional(),
      temperature: z.number().optional(),
      pH: z.number().min(0).max(14).optional(),
    })
    .optional(),
  parameters: z.record(z.any()).optional(),
});

// Prediction schemas
export const predictionConfigSchema = z.object({
  systemType: z.enum(['MFC', 'MEC', 'MDC', 'BES', 'MES']),
  anodeMaterial: z.string().min(1),
  cathodeMaterial: z.string().min(1),
  membraneType: z.string().min(1),
  reactorVolume: z.number().positive(),
  temperature: z.number().min(-50).max(200),
  pH: z.number().min(0).max(14),
  substrateType: z.string().min(1),
  substrateConcentration: z.number().positive(),
  hydraulicRetentionTime: z.number().positive().optional(),
  externalResistance: z.number().positive().optional(),
});

// API Key validation
export const apiKeySchema = z.string().regex(/^[a-zA-Z0-9_-]{32,}$/);

// Error response schema
export const errorResponseSchema = z.object({
  data: z.null(),
  error: z.object({
    message: z.string(),
    code: z.string(),
    details: z.any().optional(),
  }),
});

// Success response schemas
export const papersResponseSchema = z.object({
  data: z.object({
    papers: z.array(z.any()), // Complex paper schema
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      pages: z.number(),
    }),
    stats: z
      .object({
        totalResults: z.number(),
        systemTypes: z
          .array(
            z.object({
              type: z.string(),
              count: z.number(),
            })
          )
          .optional(),
        yearRange: z
          .object({
            min: z.number(),
            max: z.number(),
          })
          .optional(),
      })
      .optional(),
    searchTime: z.number(),
    suggestions: z.array(z.string()).optional(),
  }),
  error: z.null(),
});

/**
 * Validate request data with Zod schema
 * @param schema Zod schema to validate against
 * @param data Data to validate
 * @returns Validated data or throws validation error
 */
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationError = new Error('Validation failed');
      (validationError as any).code = 'VALIDATION_ERROR';
      (validationError as any).details = error.errors;
      throw validationError;
    }
    throw error;
  }
}

/**
 * Safe parse that returns result object instead of throwing
 */
export function safeValidate<T>(schema: z.ZodSchema<T>, data: unknown) {
  return schema.safeParse(data);
}

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[sanitizeString(key)] = sanitizeObject(value);
    }
    return sanitized;
  }

  return obj;
}

/**
 * Extract and validate query parameters
 */
export function extractQueryParams<T>(searchParams: URLSearchParams, schema: z.ZodSchema<T>): T {
  const params: Record<string, any> = {};

  searchParams.forEach((value, key) => {
    // Handle arrays (e.g., ?tag=a&tag=b)
    if (params[key]) {
      if (Array.isArray(params[key])) {
        params[key].push(value);
      } else {
        params[key] = [params[key], value];
      }
    } else {
      params[key] = value;
    }
  });

  return validateRequest(schema, params);
}
