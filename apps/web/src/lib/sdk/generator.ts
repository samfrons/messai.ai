import { generateOpenAPIDocument } from '../openapi/generator';

export function generateTypeScriptSDK(): string {
  const openApiDoc = generateOpenAPIDocument();

  return `// Auto-generated MESSAI API Client
// Generated from OpenAPI specification

export interface MessaiConfig {
  baseUrl?: string;
  apiKey?: string;
  headers?: Record<string, string>;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PapersQueryParams extends PaginationParams {
  search?: string;
  systemType?: 'MFC' | 'BES' | 'MEC' | 'MES' | 'MDC';
  yearStart?: number;
  yearEnd?: number;
  qualityScoreMin?: number;
  sort?: 'relevance' | 'date' | 'quality' | 'citations';
  verified?: boolean;
}

export interface ResearchPaper {
  id: string;
  title: string;
  abstract: string;
  authors: string[];
  publicationDate: string;
  year: number;
  url: string | null;
  pdfUrl: string | null;
  systemType: 'MFC' | 'BES' | 'MEC' | 'MES' | 'MDC';
  qualityScore: number;
  citationCount: number;
  verified: boolean;
  tags: string[];
  metadata?: Record<string, any>;
}

export interface PapersResponse {
  data: {
    papers: ResearchPaper[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
    stats: {
      totalResults: number;
      systemTypes: Record<string, number>;
      yearRange: {
        min: number;
        max: number;
      };
    };
    searchTime: number;
    suggestions?: string[];
  };
  error: null;
}

export interface ApiKey {
  id: string;
  key: string;
  name: string;
  tier: 'free' | 'premium' | 'enterprise';
  createdAt: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  permissions: string[];
  rateLimit: {
    requests: number;
    window: string;
  };
}

export interface CreateApiKeyInput {
  name: string;
  tier?: 'free' | 'premium' | 'enterprise';
  permissions?: string[];
  expiresIn?: number;
}

export interface RateLimitInfo {
  tier: 'anonymous' | 'authenticated' | 'premium';
  limit: number;
  used: number;
  remaining: number;
  resetTime: string;
  windowMs: number;
}

export interface ErrorResponse {
  error: string;
  message: string;
  details?: any;
}

export class MessaiClient {
  private config: MessaiConfig;

  constructor(config: MessaiConfig = {}) {
    this.config = {
      baseUrl: config.baseUrl || 'https://messai.ai',
      ...config,
    };
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = \`\${this.config.baseUrl}\${path}\`;
    const headers = {
      'Content-Type': 'application/json',
      ...this.config.headers,
    };

    if (this.config.apiKey) {
      headers['X-API-Key'] = this.config.apiKey;
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json() as ErrorResponse;
      throw new Error(error.message || 'API request failed');
    }

    return response.json() as Promise<T>;
  }

  // Papers endpoints
  async getPapers(params?: PapersQueryParams): Promise<PapersResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }
    
    const path = \`/api/v1/papers\${queryParams.toString() ? \`?\${queryParams}\` : ''}\`;
    return this.request<PapersResponse>(path);
  }

  async getPaper(id: string): Promise<ResearchPaper> {
    return this.request<ResearchPaper>(\`/api/v1/papers/\${id}\`);
  }

  // API Keys endpoints
  async getApiKeys(): Promise<ApiKey[]> {
    return this.request<ApiKey[]>('/api/v1/api-keys');
  }

  async createApiKey(data: CreateApiKeyInput): Promise<ApiKey> {
    return this.request<ApiKey>('/api/v1/api-keys', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteApiKey(id: string): Promise<void> {
    await this.request<void>(\`/api/v1/api-keys/\${id}\`, {
      method: 'DELETE',
    });
  }

  // Rate limit endpoint
  async getRateLimitInfo(): Promise<RateLimitInfo> {
    return this.request<RateLimitInfo>('/api/v1/rate-limit');
  }

  // Usage stats endpoint
  async getUsageStats(period: 'hour' | 'day' | 'week' | 'month' = 'day') {
    return this.request(\`/api/v1/usage?period=\${period}\`);
  }
}

// Export default instance
export default new MessaiClient();
`;
}

export function generateReactHooks(): string {
  return `// Auto-generated React hooks for MESSAI API
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessaiClient, PapersQueryParams, CreateApiKeyInput } from './client';

const client = new MessaiClient();

// Papers hooks
export function usePapers(params?: PapersQueryParams) {
  return useQuery({
    queryKey: ['papers', params],
    queryFn: () => client.getPapers(params),
  });
}

export function usePaper(id: string) {
  return useQuery({
    queryKey: ['paper', id],
    queryFn: () => client.getPaper(id),
    enabled: !!id,
  });
}

// API Keys hooks
export function useApiKeys() {
  return useQuery({
    queryKey: ['apiKeys'],
    queryFn: () => client.getApiKeys(),
  });
}

export function useCreateApiKey() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateApiKeyInput) => client.createApiKey(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
    },
  });
}

export function useDeleteApiKey() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => client.deleteApiKey(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
    },
  });
}

// Rate limit hook
export function useRateLimitInfo() {
  return useQuery({
    queryKey: ['rateLimit'],
    queryFn: () => client.getRateLimitInfo(),
    refetchInterval: 60000, // Refresh every minute
  });
}

// Usage stats hook
export function useUsageStats(period: 'hour' | 'day' | 'week' | 'month' = 'day') {
  return useQuery({
    queryKey: ['usage', period],
    queryFn: () => client.getUsageStats(period),
    refetchInterval: 300000, // Refresh every 5 minutes
  });
}
`;
}

// Generate SDK files
export async function generateSDK() {
  const clientCode = generateTypeScriptSDK();
  const hooksCode = generateReactHooks();

  return {
    'client.ts': clientCode,
    'hooks.ts': hooksCode,
    'index.ts': `export * from './client';\nexport * from './hooks';\n`,
  };
}
