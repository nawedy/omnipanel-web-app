// apps/web/src/services/localModelService.ts
// Service for managing local AI models (Ollama, local LLMs, etc.)

import { LocalModelConfig } from '@/stores/aiConfigStore';

export interface LocalModelStatus {
  id: string;
  name: string;
  isLoaded: boolean;
  isAvailable: boolean;
  loadTime?: number;
  memoryUsage?: number;
  error?: string;
}

export interface OllamaModel {
  name: string;
  size: number;
  digest: string;
  modified_at: string;
  details?: {
    format: string;
    family: string;
    families: string[];
    parameter_size: string;
    quantization_level: string;
  };
}

export class LocalModelService {
  private static instance: LocalModelService;
  private ollamaBaseUrl: string = 'http://localhost:11434';
  private modelStatusCache = new Map<string, LocalModelStatus>();
  private cacheExpiry = new Map<string, number>();
  private readonly CACHE_DURATION = 30 * 1000; // 30 seconds

  static getInstance(): LocalModelService {
    if (!LocalModelService.instance) {
      LocalModelService.instance = new LocalModelService();
    }
    return LocalModelService.instance;
  }

  /**
   * Check if Ollama is running and accessible
   */
  async isOllamaRunning(): Promise<boolean> {
    try {
      const response = await fetch(`${this.ollamaBaseUrl}/api/version`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });
      return response.ok;
    } catch (error) {
      console.log('Ollama not accessible:', error);
      return false;
    }
  }

  /**
   * Get list of available Ollama models
   */
  async getOllamaModels(): Promise<OllamaModel[]> {
    try {
      if (!(await this.isOllamaRunning())) {
        return [];
      }

      const response = await fetch(`${this.ollamaBaseUrl}/api/tags`);
      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data = await response.json();
      return data.models || [];
    } catch (error) {
      console.error('Failed to get Ollama models:', error);
      return [];
    }
  }

  /**
   * Load a specific Ollama model
   */
  async loadOllamaModel(modelName: string): Promise<boolean> {
    try {
      if (!(await this.isOllamaRunning())) {
        throw new Error('Ollama is not running');
      }

      const startTime = Date.now();
      
      // Use the generate endpoint with an empty prompt to load the model
      const response = await fetch(`${this.ollamaBaseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelName,
          prompt: '',
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to load model: ${response.status}`);
      }

      const loadTime = Date.now() - startTime;
      
      // Update cache
      this.modelStatusCache.set(modelName, {
        id: modelName,
        name: modelName,
        isLoaded: true,
        isAvailable: true,
        loadTime,
      });

      console.log(`Model ${modelName} loaded successfully in ${loadTime}ms`);
      return true;
    } catch (error) {
      console.error(`Failed to load model ${modelName}:`, error);
      
      // Update cache with error
      this.modelStatusCache.set(modelName, {
        id: modelName,
        name: modelName,
        isLoaded: false,
        isAvailable: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return false;
    }
  }

  /**
   * Check if a specific model is loaded
   */
  async isModelLoaded(modelName: string): Promise<boolean> {
    // Check cache first
    const cached = this.modelStatusCache.get(modelName);
    const cacheExpiry = this.cacheExpiry.get(modelName);
    
    if (cached && cacheExpiry && Date.now() < cacheExpiry) {
      return cached.isLoaded;
    }

    try {
      if (!(await this.isOllamaRunning())) {
        return false;
      }

      // Try a simple generation request to check if model is loaded
      const response = await fetch(`${this.ollamaBaseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelName,
          prompt: 'test',
          stream: false,
          options: {
            num_predict: 1, // Generate only 1 token
          },
        }),
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      const isLoaded = response.ok;
      
      // Update cache
      this.modelStatusCache.set(modelName, {
        id: modelName,
        name: modelName,
        isLoaded,
        isAvailable: isLoaded,
      });
      
      this.cacheExpiry.set(modelName, Date.now() + this.CACHE_DURATION);

      return isLoaded;
    } catch (error) {
      console.error(`Failed to check model status for ${modelName}:`, error);
      
      // Update cache with error
      this.modelStatusCache.set(modelName, {
        id: modelName,
        name: modelName,
        isLoaded: false,
        isAvailable: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return false;
    }
  }

  /**
   * Get status of all local models
   */
  async getAllModelStatuses(): Promise<LocalModelStatus[]> {
    const ollamaModels = await this.getOllamaModels();
    const statuses: LocalModelStatus[] = [];

    for (const model of ollamaModels) {
      const isLoaded = await this.isModelLoaded(model.name);
      statuses.push({
        id: model.name,
        name: model.name,
        isLoaded,
        isAvailable: true,
        memoryUsage: model.size,
      });
    }

    return statuses;
  }

  /**
   * Unload a model (Ollama doesn't have direct unload, but we can clear cache)
   */
  async unloadModel(modelName: string): Promise<boolean> {
    try {
      // Clear from cache
      this.modelStatusCache.delete(modelName);
      this.cacheExpiry.delete(modelName);
      
      // Note: Ollama doesn't have a direct unload API
      // Models are automatically unloaded after a period of inactivity
      console.log(`Model ${modelName} marked as unloaded`);
      return true;
    } catch (error) {
      console.error(`Failed to unload model ${modelName}:`, error);
      return false;
    }
  }

  /**
   * Get cached model status without making API calls
   */
  getCachedModelStatus(modelName: string): LocalModelStatus | null {
    const cached = this.modelStatusCache.get(modelName);
    const cacheExpiry = this.cacheExpiry.get(modelName);
    
    if (cached && cacheExpiry && Date.now() < cacheExpiry) {
      return cached;
    }
    
    return null;
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.modelStatusCache.clear();
    this.cacheExpiry.clear();
  }

  /**
   * Set custom Ollama base URL
   */
  setOllamaBaseUrl(url: string): void {
    this.ollamaBaseUrl = url;
    this.clearCache(); // Clear cache when URL changes
  }

  /**
   * Get current Ollama base URL
   */
  getOllamaBaseUrl(): string {
    return this.ollamaBaseUrl;
  }
}

// Export singleton instance
export const localModelService = LocalModelService.getInstance(); 