/**
 * Base Ollama Service
 * Simple base class for Ollama integration without circular dependencies
 */

export interface BaseOllamaConfig {
  baseUrl: string;
  model: string;
  timeout: number;
  maxRetries: number;
}

export interface BaseOllamaRequest {
  model: string;
  prompt: string;
  stream?: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
    top_k?: number;
    num_predict?: number;
    stop?: string[];
  };
}

export interface BaseOllamaResponse {
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

export class BaseOllamaService {
  protected config: BaseOllamaConfig;
  protected isAvailable: boolean = false;

  constructor(config?: Partial<BaseOllamaConfig>) {
    this.config = {
      baseUrl: config?.baseUrl || process.env['OLLAMA_BASE_URL'] || 'http://localhost:11434',
      model: config?.model || 'llama2',
      timeout: config?.timeout || 30000,
      maxRetries: config?.maxRetries || 3,
    };
  }

  async initialize(): Promise<void> {
    // Check if Ollama is available
    try {
      const response = await fetch(`${this.config.baseUrl}/api/tags`);
      this.isAvailable = response.ok;
    } catch (error) {
      this.isAvailable = false;
      console.warn('Ollama service not available:', error);
    }
  }

  async checkAvailability(): Promise<boolean> {
    return this.isAvailable;
  }

  async generate(request: BaseOllamaRequest): Promise<BaseOllamaResponse> {
    if (!this.isAvailable) {
      throw new Error('Ollama service is not available');
    }

    const response = await fetch(`${this.config.baseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Ollama request failed: ${response.statusText}`);
    }

    return response.json();
  }
}
