/**
 * Enhanced Ollama Client with Model Management
 * Advanced multi-model orchestration for research agents
 */

import { OllamaService, OllamaRequest, OllamaResponse } from './ollama-service';

export interface ModelInfo {
  id: string;
  name: string;
  description: string;
  size: string;
  capabilities: string[];
  isInstalled: boolean;
  isAvailable: boolean;
  specialization: 'extraction' | 'analysis' | 'validation' | 'general';
  version?: string;
  lastUpdated?: Date;
}

export interface ModelResponse {
  response: string;
  model: string;
  confidence: number;
  processingTime: number;
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };
  metadata?: Record<string, any>;
}

export interface ModelRequest {
  prompt: string;
  model?: string;
  template?: string;
  parameters?: {
    temperature?: number;
    top_p?: number;
    top_k?: number;
    num_predict?: number;
    stop?: string[];
  };
  context?: Record<string, any>;
  streaming?: boolean;
}

export class EnhancedOllamaClient extends OllamaService {
  private models: Map<string, ModelInfo> = new Map();
  private modelHealthStatus: Map<string, boolean> = new Map();
  private lastHealthCheck: Date = new Date();
  private healthCheckInterval: number = 5 * 60 * 1000; // 5 minutes

  constructor() {
    super();
    this.initializeModels();
  }

  private initializeModels(): void {
    // Define our specialized models
    const modelConfigs: ModelInfo[] = [
      {
        id: 'nuextract',
        name: 'NuExtract',
        description: 'Specialized model for structured data extraction from research papers',
        size: '2.2GB',
        capabilities: ['structured_extraction', 'data_parsing', 'metadata_extraction'],
        isInstalled: false,
        isAvailable: false,
        specialization: 'extraction',
        version: 'latest',
      },
      {
        id: 'phi3.5',
        name: 'Phi-3.5',
        description: 'Efficient model for general AI insights and paper analysis',
        size: '2.2GB',
        capabilities: ['analysis', 'insights', 'summarization', 'question_answering'],
        isInstalled: false,
        isAvailable: false,
        specialization: 'analysis',
        version: 'latest',
      },
      {
        id: 'llama3.1:8b',
        name: 'Llama 3.1 8B',
        description: 'General-purpose model for validation and quality assessment',
        size: '4.9GB',
        capabilities: ['validation', 'quality_assessment', 'general_reasoning'],
        isInstalled: false,
        isAvailable: false,
        specialization: 'validation',
        version: '8b',
      },
      {
        id: 'mistral-small3.2',
        name: 'Mistral Small 3.2',
        description: 'Fallback model for general tasks',
        size: '15GB',
        capabilities: ['general_reasoning', 'analysis', 'validation'],
        isInstalled: false,
        isAvailable: false,
        specialization: 'general',
        version: 'latest',
      },
    ];

    modelConfigs.forEach((model) => {
      this.models.set(model.id, model);
    });
  }

  async initialize(): Promise<void> {
    await super.initialize();
    await this.checkModelHealth();
  }

  /**
   * Check health and availability of all models
   */
  async checkModelHealth(): Promise<void> {
    if (Date.now() - this.lastHealthCheck.getTime() < this.healthCheckInterval) {
      return; // Skip if checked recently
    }

    try {
      const installedModels = await this.getInstalledModels();

      for (const [modelId, modelInfo] of this.models) {
        const isInstalled = installedModels.some((m) => m.name.startsWith(modelId));
        modelInfo.isInstalled = isInstalled;

        if (isInstalled) {
          // Test model availability with a simple prompt
          const isAvailable = await this.testModelAvailability(modelId);
          modelInfo.isAvailable = isAvailable;
          this.modelHealthStatus.set(modelId, isAvailable);
        } else {
          modelInfo.isAvailable = false;
          this.modelHealthStatus.set(modelId, false);
        }

        this.models.set(modelId, modelInfo);
      }

      this.lastHealthCheck = new Date();
    } catch (error) {
      console.error('Model health check failed:', error);
    }
  }

  /**
   * Get list of installed models from Ollama
   */
  private async getInstalledModels(): Promise<Array<{ name: string; size: string }>> {
    try {
      const response = await fetch(`${this.getConfig().baseUrl}/api/tags`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.models || [];
    } catch (error) {
      console.error('Failed to get installed models:', error);
      return [];
    }
  }

  /**
   * Test if a model is available and responsive
   */
  private async testModelAvailability(modelId: string): Promise<boolean> {
    try {
      const response = await this.generateCompletion({
        model: modelId,
        prompt: 'Test',
        options: { num_predict: 1 },
      });

      return response.done && response.response.length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Smart model selection based on task requirements
   */
  selectOptimalModel(
    taskType: 'extraction' | 'analysis' | 'validation' | 'general',
    preferences: {
      preferSpeed?: boolean;
      preferAccuracy?: boolean;
      fallbackAllowed?: boolean;
    } = {}
  ): string {
    const { preferSpeed = false, preferAccuracy = true, fallbackAllowed = true } = preferences;

    // Get available models for the task type
    const availableModels = Array.from(this.models.values())
      .filter(
        (model) =>
          model.isAvailable &&
          (model.specialization === taskType ||
            (fallbackAllowed && model.specialization === 'general'))
      )
      .sort((a, b) => {
        // Sort by specialization match first, then by size (speed) or accuracy
        if (a.specialization === taskType && b.specialization !== taskType) return -1;
        if (b.specialization === taskType && a.specialization !== taskType) return 1;

        if (preferSpeed) {
          // Prefer smaller models for speed
          return this.parseSize(a.size) - this.parseSize(b.size);
        } else if (preferAccuracy) {
          // Prefer larger models for accuracy
          return this.parseSize(b.size) - this.parseSize(a.size);
        }

        return 0;
      });

    if (availableModels.length === 0) {
      // Fallback to any available model
      const fallbackModel = Array.from(this.models.values()).find((model) => model.isAvailable);

      if (fallbackModel) {
        console.warn(`No optimal model found for ${taskType}, using fallback: ${fallbackModel.id}`);
        return fallbackModel.id;
      }

      // Last resort: use default model
      console.warn(`No models available, using default configuration`);
      return this.getConfig().model;
    }

    return availableModels[0].id;
  }

  /**
   * Parse model size string to bytes for comparison
   */
  private parseSize(sizeStr: string): number {
    const size = parseFloat(sizeStr);
    if (sizeStr.includes('GB')) return size * 1024 * 1024 * 1024;
    if (sizeStr.includes('MB')) return size * 1024 * 1024;
    if (sizeStr.includes('KB')) return size * 1024;
    return size;
  }

  /**
   * Enhanced completion with automatic model selection
   */
  async generateEnhancedCompletion(request: ModelRequest): Promise<ModelResponse> {
    const startTime = Date.now();

    // Auto-select model if not specified
    let modelId = request.model;
    if (!modelId) {
      // Infer task type from prompt/template
      const taskType = this.inferTaskType(request.prompt, request.template);
      modelId = this.selectOptimalModel(taskType);
    }

    // Ensure model is available
    await this.checkModelHealth();

    if (!this.modelHealthStatus.get(modelId)) {
      throw new Error(`Model ${modelId} is not available`);
    }

    try {
      const response = await this.generateCompletion({
        model: modelId,
        prompt: request.prompt,
        options: request.parameters,
        stream: request.streaming,
      });

      const processingTime = Date.now() - startTime;

      return {
        response: response.response,
        model: modelId,
        confidence: this.calculateResponseConfidence(response),
        processingTime,
        tokens: {
          prompt: response.prompt_eval_count || 0,
          completion: response.eval_count || 0,
          total: (response.prompt_eval_count || 0) + (response.eval_count || 0),
        },
        metadata: {
          modelInfo: this.models.get(modelId),
          ollamaResponse: response,
        },
      };
    } catch (error) {
      console.error(`Model ${modelId} failed:`, error);

      // Try fallback model if available
      if (request.model !== modelId) {
        const fallbackModel = this.selectOptimalModel('general', { fallbackAllowed: true });
        if (fallbackModel !== modelId) {
          console.warn(`Retrying with fallback model: ${fallbackModel}`);
          return this.generateEnhancedCompletion({
            ...request,
            model: fallbackModel,
          });
        }
      }

      throw error;
    }
  }

  /**
   * Infer task type from prompt content
   */
  private inferTaskType(
    prompt: string,
    template?: string
  ): 'extraction' | 'analysis' | 'validation' | 'general' {
    const lowerPrompt = prompt.toLowerCase();
    const lowerTemplate = template?.toLowerCase() || '';

    const extractionKeywords = [
      'extract',
      'parse',
      'structure',
      'data',
      'metadata',
      'json',
      'fields',
    ];
    const analysisKeywords = ['analyze', 'insights', 'summary', 'trends', 'patterns', 'understand'];
    const validationKeywords = ['validate', 'quality', 'assess', 'verify', 'check', 'score'];

    const text = lowerPrompt + ' ' + lowerTemplate;

    if (extractionKeywords.some((keyword) => text.includes(keyword))) {
      return 'extraction';
    }

    if (analysisKeywords.some((keyword) => text.includes(keyword))) {
      return 'analysis';
    }

    if (validationKeywords.some((keyword) => text.includes(keyword))) {
      return 'validation';
    }

    return 'general';
  }

  /**
   * Calculate response confidence based on model performance
   */
  private calculateResponseConfidence(response: any): number {
    let confidence = 0.7; // Base confidence

    // Factor in response completeness
    if (response.done) confidence += 0.1;
    if (response.response && response.response.length > 50) confidence += 0.1;

    // Factor in processing metrics
    if (response.eval_count && response.eval_count > 20) confidence += 0.05;
    if (response.total_duration && response.total_duration < 10000) confidence += 0.05;

    return Math.min(1.0, confidence);
  }

  /**
   * Get model information
   */
  getModelInfo(modelId: string): ModelInfo | undefined {
    return this.models.get(modelId);
  }

  /**
   * Get all available models
   */
  getAvailableModels(): ModelInfo[] {
    return Array.from(this.models.values()).filter((model) => model.isAvailable);
  }

  /**
   * Get model health status
   */
  getModelHealthStatus(): Map<string, boolean> {
    return new Map(this.modelHealthStatus);
  }

  /**
   * Force model health check
   */
  async forceHealthCheck(): Promise<void> {
    this.lastHealthCheck = new Date(0); // Reset timestamp
    await this.checkModelHealth();
  }

  /**
   * Install model if not present
   */
  async installModel(modelId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.getConfig().baseUrl}/api/pull`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: modelId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to install model: ${response.status}`);
      }

      // Update model status
      const modelInfo = this.models.get(modelId);
      if (modelInfo) {
        modelInfo.isInstalled = true;
        modelInfo.lastUpdated = new Date();
        this.models.set(modelId, modelInfo);
      }

      // Refresh health status
      await this.forceHealthCheck();

      return true;
    } catch (error) {
      console.error(`Failed to install model ${modelId}:`, error);
      return false;
    }
  }

  /**
   * Get system status
   */
  async getSystemStatus(): Promise<{
    isOllamaRunning: boolean;
    installedModels: number;
    availableModels: number;
    totalModels: number;
    lastHealthCheck: Date;
    systemHealth: 'good' | 'warning' | 'error';
  }> {
    const isOllamaRunning = this.isServiceAvailable();
    const installedModels = Array.from(this.models.values()).filter((m) => m.isInstalled).length;
    const availableModels = Array.from(this.models.values()).filter((m) => m.isAvailable).length;
    const totalModels = this.models.size;

    let systemHealth: 'good' | 'warning' | 'error' = 'good';

    if (!isOllamaRunning) {
      systemHealth = 'error';
    } else if (availableModels < totalModels / 2) {
      systemHealth = 'warning';
    }

    return {
      isOllamaRunning,
      installedModels,
      availableModels,
      totalModels,
      lastHealthCheck: this.lastHealthCheck,
      systemHealth,
    };
  }
}
