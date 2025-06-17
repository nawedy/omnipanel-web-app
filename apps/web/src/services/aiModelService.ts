// apps/web/src/services/aiModelService.ts
// AI model management service for API validation, model discovery, and performance monitoring

import { AIModel, APIConfig, LocalModelConfig, ModelPerformance } from '@/stores/aiConfigStore';

// API Validation Response
interface APIValidationResult {
  isValid: boolean;
  errorMessage?: string;
  modelList?: string[];
  rateLimits?: {
    requestsPerMinute: number;
    tokensPerMinute: number;
  };
}

// Model Discovery Result
interface ModelDiscoveryResult {
  models: AIModel[];
  source: 'api' | 'local' | 'ollama';
  timestamp: Date;
}

// Performance Test Result
interface PerformanceTestResult {
  responseTime: number;
  tokensPerSecond: number;
  success: boolean;
  errorMessage?: string;
}

class AIModelService {
  private readonly API_TIMEOUT = 10000; // 10 seconds
  private readonly TEST_PROMPT = "Hello! Please respond with 'OK' to confirm the connection.";

  /**
   * Validate an API configuration by making a test request
   */
  async validateAPIConfig(config: APIConfig): Promise<APIValidationResult> {
    try {
      switch (config.provider) {
        case 'openai':
          return await this.validateOpenAIConfig(config);
        case 'anthropic':
          return await this.validateAnthropicConfig(config);
        case 'google':
          return await this.validateGoogleConfig(config);
        default:
          return await this.validateCustomConfig(config);
      }
    } catch (error) {
      return {
        isValid: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown validation error'
      };
    }
  }

  /**
   * Validate OpenAI API configuration
   */
  private async validateOpenAIConfig(config: APIConfig): Promise<APIValidationResult> {
    const baseUrl = config.baseUrl || 'https://api.openai.com/v1';
    
    try {
      // Test with models endpoint first
      const modelsResponse = await fetch(`${baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(this.API_TIMEOUT)
      });

      if (!modelsResponse.ok) {
        const error = await modelsResponse.json().catch(() => ({}));
        return {
          isValid: false,
          errorMessage: error.error?.message || `HTTP ${modelsResponse.status}: ${modelsResponse.statusText}`
        };
      }

      const modelsData = await modelsResponse.json();
      const modelList = modelsData.data?.map((model: any) => model.id) || [];

      // Test with a simple chat completion
      const testResponse = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: this.TEST_PROMPT }],
          max_tokens: 10,
          temperature: 0
        }),
        signal: AbortSignal.timeout(this.API_TIMEOUT)
      });

      if (!testResponse.ok) {
        const error = await testResponse.json().catch(() => ({}));
        return {
          isValid: false,
          errorMessage: error.error?.message || `Test request failed: HTTP ${testResponse.status}`
        };
      }

      return {
        isValid: true,
        modelList,
        rateLimits: {
          requestsPerMinute: 3500, // Default OpenAI limits
          tokensPerMinute: 90000
        }
      };
    } catch (error) {
      return {
        isValid: false,
        errorMessage: error instanceof Error ? error.message : 'OpenAI validation failed'
      };
    }
  }

  /**
   * Validate Anthropic API configuration
   */
  private async validateAnthropicConfig(config: APIConfig): Promise<APIValidationResult> {
    const baseUrl = config.baseUrl || 'https://api.anthropic.com/v1';
    
    try {
      const testResponse = await fetch(`${baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'x-api-key': config.apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 10,
          messages: [{ role: 'user', content: this.TEST_PROMPT }]
        }),
        signal: AbortSignal.timeout(this.API_TIMEOUT)
      });

      if (!testResponse.ok) {
        const error = await testResponse.json().catch(() => ({}));
        return {
          isValid: false,
          errorMessage: error.error?.message || `HTTP ${testResponse.status}: ${testResponse.statusText}`
        };
      }

      return {
        isValid: true,
        modelList: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
        rateLimits: {
          requestsPerMinute: 1000,
          tokensPerMinute: 40000
        }
      };
    } catch (error) {
      return {
        isValid: false,
        errorMessage: error instanceof Error ? error.message : 'Anthropic validation failed'
      };
    }
  }

  /**
   * Validate Google AI API configuration
   */
  private async validateGoogleConfig(config: APIConfig): Promise<APIValidationResult> {
    const baseUrl = config.baseUrl || 'https://generativelanguage.googleapis.com/v1beta';
    
    try {
      const testResponse = await fetch(`${baseUrl}/models/gemini-pro:generateContent?key=${config.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: this.TEST_PROMPT }]
          }],
          generationConfig: {
            maxOutputTokens: 10,
            temperature: 0
          }
        }),
        signal: AbortSignal.timeout(this.API_TIMEOUT)
      });

      if (!testResponse.ok) {
        const error = await testResponse.json().catch(() => ({}));
        return {
          isValid: false,
          errorMessage: error.error?.message || `HTTP ${testResponse.status}: ${testResponse.statusText}`
        };
      }

      return {
        isValid: true,
        modelList: ['gemini-pro', 'gemini-pro-vision'],
        rateLimits: {
          requestsPerMinute: 60,
          tokensPerMinute: 32000
        }
      };
    } catch (error) {
      return {
        isValid: false,
        errorMessage: error instanceof Error ? error.message : 'Google AI validation failed'
      };
    }
  }

  /**
   * Validate custom API configuration
   */
  private async validateCustomConfig(config: APIConfig): Promise<APIValidationResult> {
    if (!config.baseUrl) {
      return {
        isValid: false,
        errorMessage: 'Base URL is required for custom API configurations'
      };
    }

    try {
      // Try OpenAI-compatible endpoint first
      const testResponse = await fetch(`${config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'default',
          messages: [{ role: 'user', content: this.TEST_PROMPT }],
          max_tokens: 10,
          temperature: 0
        }),
        signal: AbortSignal.timeout(this.API_TIMEOUT)
      });

      if (!testResponse.ok) {
        return {
          isValid: false,
          errorMessage: `HTTP ${testResponse.status}: ${testResponse.statusText}`
        };
      }

      return {
        isValid: true,
        modelList: ['default'],
        rateLimits: {
          requestsPerMinute: 1000,
          tokensPerMinute: 10000
        }
      };
    } catch (error) {
      return {
        isValid: false,
        errorMessage: error instanceof Error ? error.message : 'Custom API validation failed'
      };
    }
  }

  /**
   * Discover available models from various sources
   */
  async discoverModels(): Promise<ModelDiscoveryResult[]> {
    const results: ModelDiscoveryResult[] = [];

    // Discover Ollama models if available
    try {
      const ollamaModels = await this.discoverOllamaModels();
      if (ollamaModels.models.length > 0) {
        results.push(ollamaModels);
      }
    } catch (error) {
      console.warn('Ollama discovery failed:', error);
    }

    return results;
  }

  /**
   * Discover Ollama models
   */
  private async discoverOllamaModels(): Promise<ModelDiscoveryResult> {
    try {
      const response = await fetch('http://localhost:11434/api/tags', {
        signal: AbortSignal.timeout(5000)
      });

      if (!response.ok) {
        throw new Error(`Ollama API not available: ${response.status}`);
      }

      const data = await response.json();
      const models: AIModel[] = data.models?.map((model: any) => ({
        id: `ollama-${model.name}`,
        name: model.name,
        provider: 'ollama' as const,
        type: 'chat' as const,
        maxTokens: 4096,
        contextWindow: model.details?.parameter_size ? parseInt(model.details.parameter_size) * 1000 : 4096,
        isLocal: true,
        isAvailable: true,
        capabilities: ['chat', 'code'],
        description: `Local Ollama model: ${model.name}`,
        version: model.modified_at
      })) || [];

      return {
        models,
        source: 'ollama',
        timestamp: new Date()
      };
    } catch (error) {
      return {
        models: [],
        source: 'ollama',
        timestamp: new Date()
      };
    }
  }

  /**
   * Test model performance
   */
  async testModelPerformance(modelId: string, config: APIConfig): Promise<PerformanceTestResult> {
    const startTime = Date.now();
    
    try {
      const result = await this.validateAPIConfig(config);
      const endTime = Date.now();
      
      if (!result.isValid) {
        return {
          responseTime: endTime - startTime,
          tokensPerSecond: 0,
          success: false,
          errorMessage: result.errorMessage
        };
      }

      // Estimate tokens per second (rough calculation)
      const responseTime = endTime - startTime;
      const estimatedTokens = 10; // Based on our test prompt
      const tokensPerSecond = (estimatedTokens / responseTime) * 1000;

      return {
        responseTime,
        tokensPerSecond,
        success: true
      };
    } catch (error) {
      return {
        responseTime: Date.now() - startTime,
        tokensPerSecond: 0,
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Performance test failed'
      };
    }
  }

  /**
   * Get model recommendations based on use case
   */
  getModelRecommendations(useCase: 'chat' | 'code' | 'analysis' | 'creative'): AIModel[] {
    const recommendations: Record<string, string[]> = {
      chat: ['gpt-4', 'claude-3-sonnet', 'gpt-3.5-turbo'],
      code: ['gpt-4', 'claude-3-opus', 'gpt-3.5-turbo'],
      analysis: ['claude-3-opus', 'gpt-4', 'claude-3-sonnet'],
      creative: ['gpt-4', 'claude-3-opus', 'claude-3-sonnet']
    };

    const modelIds = recommendations[useCase] || [];
    
    // Convert string IDs to AIModel objects (simplified for now)
    return modelIds.map(id => ({
      id,
      name: id,
      provider: id.includes('gpt') ? 'openai' : id.includes('claude') ? 'anthropic' : 'custom',
      type: 'chat' as const,
      maxTokens: 4096,
      contextWindow: 4096,
      isLocal: false,
      isAvailable: true,
      capabilities: ['chat'],
      description: `Recommended model for ${useCase}`
    }));
  }

  /**
   * Calculate estimated cost for a request
   */
  calculateEstimatedCost(model: AIModel, inputTokens: number, outputTokens: number): number {
    if (!model.costPer1kTokens) return 0;
    
    const totalTokens = inputTokens + outputTokens;
    return (totalTokens / 1000) * model.costPer1kTokens;
  }

  /**
   * Get model status (available, rate limited, etc.)
   */
  async getModelStatus(modelId: string, config: APIConfig): Promise<{
    status: 'available' | 'unavailable' | 'rate_limited' | 'error';
    message?: string;
  }> {
    try {
      const result = await this.validateAPIConfig(config);
      
      if (result.isValid) {
        return { status: 'available' };
      } else {
        const isRateLimit = result.errorMessage?.toLowerCase().includes('rate limit') ||
                           result.errorMessage?.toLowerCase().includes('quota');
        
        return {
          status: isRateLimit ? 'rate_limited' : 'error',
          message: result.errorMessage
        };
      }
    } catch (error) {
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Export model configuration
   */
  exportModelConfig(models: AIModel[], configs: APIConfig[]): string {
    const exportData = {
      models: models.map(m => ({ ...m, isAvailable: false })), // Reset availability
      configs: configs.map(c => ({ ...c, apiKey: '***', isValid: false })), // Remove sensitive data
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import model configuration
   */
  importModelConfig(configString: string): { models: AIModel[]; configs: Omit<APIConfig, 'apiKey'>[] } {
    try {
      const data = JSON.parse(configString);
      
      return {
        models: data.models || [],
        configs: (data.configs || []).map((c: any) => ({ ...c, apiKey: '' })) // Remove API keys for security
      };
    } catch (error) {
      throw new Error('Invalid configuration format');
    }
  }
}

export const aiModelService = new AIModelService(); 