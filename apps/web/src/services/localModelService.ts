// apps/web/src/services/localModelService.ts
// Local model management service for Ollama integration and local AI model support

import { LocalModelConfig } from '@/stores/aiConfigStore';

// Ollama Model Info
interface OllamaModelInfo {
  name: string;
  modified_at: string;
  size: number;
  digest: string;
  details: {
    format: string;
    family: string;
    families: string[];
    parameter_size: string;
    quantization_level: string;
  };
}

// Model Installation Progress
interface ModelInstallProgress {
  status: 'downloading' | 'verifying' | 'writing' | 'success' | 'error';
  digest: string;
  total: number;
  completed: number;
  percentage: number;
}

// System Resources
interface SystemResources {
  totalMemory: number;
  availableMemory: number;
  cpuCores: number;
  gpuMemory?: number;
  diskSpace: number;
}

// Model Performance Metrics
interface LocalModelPerformance {
  modelId: string;
  loadTime: number;
  memoryUsage: number;
  tokensPerSecond: number;
  cpuUsage: number;
  gpuUsage?: number;
  temperature: number;
  lastUsed: Date;
}

class LocalModelService {
  private readonly OLLAMA_BASE_URL = 'http://localhost:11434';
  private readonly OLLAMA_TIMEOUT = 30000; // 30 seconds for model operations
  private modelPerformance: Map<string, LocalModelPerformance> = new Map();

  /**
   * Check if Ollama is running and accessible
   */
  async isOllamaAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.OLLAMA_BASE_URL}/api/version`, {
        signal: AbortSignal.timeout(5000)
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get Ollama version information
   */
  async getOllamaVersion(): Promise<{ version: string } | null> {
    try {
      const response = await fetch(`${this.OLLAMA_BASE_URL}/api/version`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      return null;
    }
  }

  /**
   * List all installed Ollama models
   */
  async listOllamaModels(): Promise<LocalModelConfig[]> {
    try {
      const response = await fetch(`${this.OLLAMA_BASE_URL}/api/tags`);
      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.status}`);
      }

      const data = await response.json();
      return data.models?.map((model: OllamaModelInfo) => ({
        id: `ollama-${model.name}`,
        name: model.name,
        path: model.name, // Ollama uses model names as paths
        type: 'ollama' as const,
        size: model.size,
        isLoaded: false, // We'll check this separately
        parameters: {
          format: model.details?.format,
          family: model.details?.family,
          parameterSize: model.details?.parameter_size,
          quantization: model.details?.quantization_level,
          digest: model.digest,
          modifiedAt: model.modified_at
        }
      })) || [];
    } catch (error) {
      console.error('Failed to list Ollama models:', error);
      return [];
    }
  }

  /**
   * Pull/install a model from Ollama registry
   */
  async pullOllamaModel(
    modelName: string,
    onProgress?: (progress: ModelInstallProgress) => void
  ): Promise<boolean> {
    try {
      const response = await fetch(`${this.OLLAMA_BASE_URL}/api/pull`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: modelName }),
        signal: AbortSignal.timeout(this.OLLAMA_TIMEOUT)
      });

      if (!response.ok) {
        throw new Error(`Failed to pull model: ${response.status}`);
      }

      // Handle streaming response for progress updates
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            try {
              const progress = JSON.parse(line);
              if (onProgress && progress.status) {
                onProgress({
                  status: progress.status,
                  digest: progress.digest || '',
                  total: progress.total || 0,
                  completed: progress.completed || 0,
                  percentage: progress.total ? (progress.completed / progress.total) * 100 : 0
                });
              }
            } catch (parseError) {
              // Ignore JSON parse errors for non-JSON lines
            }
          }
        }
      }

      return true;
    } catch (error) {
      console.error('Failed to pull Ollama model:', error);
      return false;
    }
  }

  /**
   * Delete an Ollama model
   */
  async deleteOllamaModel(modelName: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.OLLAMA_BASE_URL}/api/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: modelName })
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to delete Ollama model:', error);
      return false;
    }
  }

  /**
   * Load a model into memory
   */
  async loadModel(modelConfig: LocalModelConfig): Promise<boolean> {
    if (modelConfig.type === 'ollama') {
      return await this.loadOllamaModel(modelConfig.name);
    }
    
    // Handle other local model types here
    return false;
  }

  /**
   * Load an Ollama model into memory
   */
  private async loadOllamaModel(modelName: string): Promise<boolean> {
    const startTime = Date.now();
    
    try {
      // Generate a simple request to load the model
      const response = await fetch(`${this.OLLAMA_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: modelName,
          prompt: 'Hello',
          stream: false,
          options: {
            num_predict: 1
          }
        }),
        signal: AbortSignal.timeout(this.OLLAMA_TIMEOUT)
      });

      if (!response.ok) {
        throw new Error(`Failed to load model: ${response.status}`);
      }

      const loadTime = Date.now() - startTime;
      
      // Update performance metrics
      this.modelPerformance.set(`ollama-${modelName}`, {
        modelId: `ollama-${modelName}`,
        loadTime,
        memoryUsage: 0, // We'll need to get this from system monitoring
        tokensPerSecond: 0,
        cpuUsage: 0,
        temperature: 0.7,
        lastUsed: new Date()
      });

      return true;
    } catch (error) {
      console.error('Failed to load Ollama model:', error);
      return false;
    }
  }

  /**
   * Unload a model from memory
   */
  async unloadModel(modelConfig: LocalModelConfig): Promise<boolean> {
    if (modelConfig.type === 'ollama') {
      // Ollama doesn't have explicit unload, but we can clear our tracking
      this.modelPerformance.delete(modelConfig.id);
      return true;
    }
    
    return false;
  }

  /**
   * Test model performance
   */
  async testModelPerformance(modelConfig: LocalModelConfig): Promise<LocalModelPerformance | null> {
    if (modelConfig.type !== 'ollama') {
      return null;
    }

    const startTime = Date.now();
    const testPrompt = 'Count from 1 to 10.';
    
    try {
      const response = await fetch(`${this.OLLAMA_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: modelConfig.name,
          prompt: testPrompt,
          stream: false,
          options: {
            num_predict: 50,
            temperature: 0.1
          }
        }),
        signal: AbortSignal.timeout(this.OLLAMA_TIMEOUT)
      });

      if (!response.ok) {
        throw new Error(`Performance test failed: ${response.status}`);
      }

      const result = await response.json();
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      // Estimate tokens per second
      const estimatedTokens = result.response?.split(' ').length || 0;
      const tokensPerSecond = estimatedTokens > 0 ? (estimatedTokens / responseTime) * 1000 : 0;

      const performance: LocalModelPerformance = {
        modelId: modelConfig.id,
        loadTime: responseTime,
        memoryUsage: 0, // Would need system monitoring
        tokensPerSecond,
        cpuUsage: 0, // Would need system monitoring
        temperature: 0.1,
        lastUsed: new Date()
      };

      this.modelPerformance.set(modelConfig.id, performance);
      return performance;
    } catch (error) {
      console.error('Performance test failed:', error);
      return null;
    }
  }

  /**
   * Get system resources
   */
  async getSystemResources(): Promise<SystemResources> {
    // This would typically require a native module or system API
    // For now, return estimated values
    return {
      totalMemory: 16 * 1024 * 1024 * 1024, // 16GB
      availableMemory: 8 * 1024 * 1024 * 1024, // 8GB
      cpuCores: navigator.hardwareConcurrency || 4,
      diskSpace: 500 * 1024 * 1024 * 1024 // 500GB
    };
  }

  /**
   * Get model performance metrics
   */
  getModelPerformance(modelId: string): LocalModelPerformance | null {
    return this.modelPerformance.get(modelId) || null;
  }

  /**
   * Get all performance metrics
   */
  getAllPerformanceMetrics(): LocalModelPerformance[] {
    return Array.from(this.modelPerformance.values());
  }

  /**
   * Search available models in Ollama registry
   */
  async searchOllamaModels(query: string): Promise<string[]> {
    // This would typically query the Ollama registry
    // For now, return common model names that match the query
    const commonModels = [
      'llama2', 'llama2:7b', 'llama2:13b', 'llama2:70b',
      'codellama', 'codellama:7b', 'codellama:13b', 'codellama:34b',
      'mistral', 'mistral:7b', 'mistral:instruct',
      'neural-chat', 'starling-lm', 'zephyr',
      'phi', 'phi:2.7b', 'orca-mini', 'vicuna',
      'wizardcoder', 'sqlcoder', 'magicoder'
    ];

    return commonModels.filter(model => 
      model.toLowerCase().includes(query.toLowerCase())
    );
  }

  /**
   * Get model recommendations based on system resources
   */
  getModelRecommendations(resources: SystemResources): string[] {
    const availableMemoryGB = resources.availableMemory / (1024 * 1024 * 1024);
    
    if (availableMemoryGB >= 32) {
      return ['llama2:70b', 'codellama:34b', 'mistral:7b'];
    } else if (availableMemoryGB >= 16) {
      return ['llama2:13b', 'codellama:13b', 'mistral:7b'];
    } else if (availableMemoryGB >= 8) {
      return ['llama2:7b', 'codellama:7b', 'phi:2.7b'];
    } else {
      return ['phi', 'orca-mini', 'neural-chat'];
    }
  }

  /**
   * Estimate model memory requirements
   */
  estimateModelMemoryRequirement(modelName: string): number {
    // Rough estimates in GB
    const memoryEstimates: Record<string, number> = {
      'llama2:70b': 40,
      'llama2:13b': 8,
      'llama2:7b': 4,
      'codellama:34b': 20,
      'codellama:13b': 8,
      'codellama:7b': 4,
      'mistral:7b': 4,
      'phi:2.7b': 2,
      'phi': 1.5,
      'orca-mini': 2,
      'neural-chat': 4
    };

    return memoryEstimates[modelName] || 4; // Default to 4GB
  }

  /**
   * Check if model can run on current system
   */
  async canRunModel(modelName: string): Promise<{
    canRun: boolean;
    reason?: string;
    recommendation?: string;
  }> {
    const resources = await this.getSystemResources();
    const requiredMemory = this.estimateModelMemoryRequirement(modelName);
    const availableMemoryGB = resources.availableMemory / (1024 * 1024 * 1024);

    if (requiredMemory > availableMemoryGB) {
      const recommendations = this.getModelRecommendations(resources);
      return {
        canRun: false,
        reason: `Model requires ${requiredMemory}GB memory, but only ${availableMemoryGB.toFixed(1)}GB available`,
        recommendation: `Try smaller models: ${recommendations.slice(0, 3).join(', ')}`
      };
    }

    return { canRun: true };
  }

  /**
   * Monitor model usage and update performance metrics
   */
  updateModelUsage(modelId: string, tokensGenerated: number, responseTime: number): void {
    const existing = this.modelPerformance.get(modelId);
    if (existing) {
      const tokensPerSecond = (tokensGenerated / responseTime) * 1000;
      this.modelPerformance.set(modelId, {
        ...existing,
        tokensPerSecond: (existing.tokensPerSecond + tokensPerSecond) / 2, // Moving average
        lastUsed: new Date()
      });
    }
  }

  /**
   * Clear performance metrics
   */
  clearPerformanceMetrics(): void {
    this.modelPerformance.clear();
  }
}

export const localModelService = new LocalModelService(); 