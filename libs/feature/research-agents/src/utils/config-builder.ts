/**
 * Configuration Builder - Helps build agent configurations
 */

import type { AgentConfiguration, AgentCapability } from '../types/agent.types';

export class ConfigBuilder {
  private config: Partial<AgentConfiguration> = {};

  constructor(id?: string) {
    if (id) {
      this.config.id = id;
    }
  }

  withId(id: string): ConfigBuilder {
    this.config.id = id;
    return this;
  }

  withMaxConcurrentTasks(maxTasks: number): ConfigBuilder {
    this.config.maxConcurrentTasks = maxTasks;
    return this;
  }

  withTimeout(timeoutMs: number): ConfigBuilder {
    this.config.timeoutMs = timeoutMs;
    return this;
  }

  withRetryPolicy(maxRetries: number, backoffMs: number): ConfigBuilder {
    this.config.retryPolicy = {
      maxRetries,
      backoffMs,
    };
    return this;
  }

  withResourceLimits(maxMemoryMb: number, maxTokens: number): ConfigBuilder {
    this.config.resourceLimits = {
      maxMemoryMb,
      maxTokens,
    };
    return this;
  }

  withCapabilities(capabilities: AgentCapability[]): ConfigBuilder {
    this.config.capabilities = capabilities;
    return this;
  }

  // Preset configurations for different environments
  forDevelopment(): ConfigBuilder {
    return this.withMaxConcurrentTasks(2)
      .withTimeout(180000) // 3 minutes
      .withRetryPolicy(2, 500)
      .withResourceLimits(256, 5000);
  }

  forProduction(): ConfigBuilder {
    return this.withMaxConcurrentTasks(5)
      .withTimeout(600000) // 10 minutes
      .withRetryPolicy(3, 2000)
      .withResourceLimits(1024, 20000);
  }

  forTesting(): ConfigBuilder {
    return this.withMaxConcurrentTasks(1)
      .withTimeout(30000) // 30 seconds
      .withRetryPolicy(1, 100)
      .withResourceLimits(128, 1000);
  }

  build(): AgentConfiguration {
    if (!this.config.id) {
      throw new Error('Agent ID is required');
    }

    return {
      id: this.config.id,
      maxConcurrentTasks: this.config.maxConcurrentTasks ?? 3,
      timeoutMs: this.config.timeoutMs ?? 300000,
      retryPolicy: this.config.retryPolicy ?? {
        maxRetries: 3,
        backoffMs: 1000,
      },
      resourceLimits: this.config.resourceLimits ?? {
        maxMemoryMb: 512,
        maxTokens: 10000,
      },
      capabilities: this.config.capabilities ?? [],
    };
  }
}

// Convenience function for creating configurations
export function createConfig(): ConfigBuilder {
  return new ConfigBuilder();
}
