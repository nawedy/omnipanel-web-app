import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as os from 'os';
import axios from 'axios';

export interface LocalModel {
  name: string;
  size: number;
  modified: Date;
  digest: string;
  details: {
    family: string;
    parameter_size: string;
    quantization_level: string;
  };
}

export interface ModelDownloadProgress {
  status: 'downloading' | 'complete' | 'error';
  progress: number;
  total?: number;
  completed?: number;
  error?: string;
}

export interface ServerStatus {
  running: boolean;
  pid?: number;
  port?: number;
  version?: string;
  models?: LocalModel[];
}

export class ModelServerManager {
  private ollamaProcess: ChildProcess | null = null;
  private ollamaPort = 11434;
  private ollamaHost = 'localhost';
  private downloadProgress = new Map<string, ModelDownloadProgress>();

  constructor() {
    // Initialize any required state
  }

  /**
   * Start Ollama server
   */
  async startOllama(): Promise<{ success: boolean; message: string; pid?: number }> {
    try {
      // Check if Ollama is already running
      const isRunning = await this.isOllamaRunning();
      if (isRunning) {
        return {
          success: true,
          message: 'Ollama server is already running',
        };
      }

      // Find Ollama executable
      const ollamaPath = await this.findOllamaExecutable();
      if (!ollamaPath) {
        return {
          success: false,
          message: 'Ollama executable not found. Please install Ollama first.',
        };
      }

      // Start Ollama server
      this.ollamaProcess = spawn(ollamaPath, ['serve'], {
        detached: false,
        stdio: ['pipe', 'pipe', 'pipe'],
        env: {
          ...process.env,
          OLLAMA_HOST: `${this.ollamaHost}:${this.ollamaPort}`,
        },
      });

      // Handle process events
      this.ollamaProcess.on('error', (error) => {
        console.error('Ollama process error:', error);
      });

      this.ollamaProcess.on('exit', (code, signal) => {
        console.log(`Ollama process exited with code ${code} and signal ${signal}`);
        this.ollamaProcess = null;
      });

      // Wait for server to be ready
      const ready = await this.waitForOllamaReady(10000); // 10 second timeout
      
      if (ready) {
        return {
          success: true,
          message: 'Ollama server started successfully',
          pid: this.ollamaProcess.pid,
        };
      } else {
        return {
          success: false,
          message: 'Ollama server failed to start within timeout',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Failed to start Ollama: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Stop Ollama server
   */
  async stopOllama(): Promise<{ success: boolean; message: string }> {
    try {
      if (this.ollamaProcess) {
        this.ollamaProcess.kill('SIGTERM');
        
        // Wait for process to exit
        await new Promise((resolve) => {
          this.ollamaProcess?.on('exit', resolve);
          // Force kill after 5 seconds
          setTimeout(() => {
            if (this.ollamaProcess) {
              this.ollamaProcess.kill('SIGKILL');
            }
            resolve(undefined);
          }, 5000);
        });

        this.ollamaProcess = null;
        
        return {
          success: true,
          message: 'Ollama server stopped successfully',
        };
      } else {
        return {
          success: true,
          message: 'Ollama server was not running',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Failed to stop Ollama: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Get Ollama server status
   */
  async getOllamaStatus(): Promise<ServerStatus> {
    const running = await this.isOllamaRunning();
    
    if (!running) {
      return { running: false };
    }

    try {
      const [versionResponse, modelsResponse] = await Promise.allSettled([
        this.makeOllamaRequest('/api/version'),
        this.makeOllamaRequest('/api/tags'),
      ]);

      const version = versionResponse.status === 'fulfilled' ? 
        versionResponse.value.version : undefined;
      
      const models = modelsResponse.status === 'fulfilled' ? 
        modelsResponse.value.models.map((model: any) => this.normalizeModel(model)) : [];

      return {
        running: true,
        pid: this.ollamaProcess?.pid,
        port: this.ollamaPort,
        version,
        models,
      };
    } catch (error) {
      return {
        running: true,
        pid: this.ollamaProcess?.pid,
        port: this.ollamaPort,
      };
    }
  }

  /**
   * Get list of local models
   */
  async getLocalModels(): Promise<LocalModel[]> {
    try {
      const response = await this.makeOllamaRequest('/api/tags');
      return response.models.map((model: any) => this.normalizeModel(model));
    } catch (error) {
      throw new Error(`Failed to get local models: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Download a model
   */
  async downloadModel(
    modelName: string, 
    onProgress?: (progress: ModelDownloadProgress) => void
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Initialize progress tracking
      this.downloadProgress.set(modelName, {
        status: 'downloading',
        progress: 0,
      });

      const response = await fetch(`http://${this.ollamaHost}:${this.ollamaPort}/api/pull`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: modelName, stream: true }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

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
              const data = JSON.parse(line);
              
              if (data.total && data.completed) {
                const progress = Math.round((data.completed / data.total) * 100);
                const progressData: ModelDownloadProgress = {
                  status: 'downloading',
                  progress,
                  total: data.total,
                  completed: data.completed,
                };
                
                this.downloadProgress.set(modelName, progressData);
                onProgress?.(progressData);
              }

              if (data.status === 'success' || data.status === 'complete') {
                const completeData: ModelDownloadProgress = {
                  status: 'complete',
                  progress: 100,
                };
                
                this.downloadProgress.set(modelName, completeData);
                onProgress?.(completeData);
                break;
              }
            } catch (parseError) {
              // Ignore JSON parse errors for individual lines
            }
          }
        }
      }

      return {
        success: true,
        message: `Model ${modelName} downloaded successfully`,
      };
    } catch (error) {
      const errorData: ModelDownloadProgress = {
        status: 'error',
        progress: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      
      this.downloadProgress.set(modelName, errorData);
      onProgress?.(errorData);

      return {
        success: false,
        message: `Failed to download model ${modelName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Delete a model
   */
  async deleteModel(modelName: string): Promise<{ success: boolean; message: string }> {
    try {
      await this.makeOllamaRequest('/api/delete', {
        method: 'DELETE',
        body: JSON.stringify({ name: modelName }),
      });

      return {
        success: true,
        message: `Model ${modelName} deleted successfully`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to delete model ${modelName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Get download progress for a model
   */
  getDownloadProgress(modelName: string): ModelDownloadProgress | null {
    return this.downloadProgress.get(modelName) || null;
  }

  /**
   * Stop all running servers
   */
  async stopAllServers(): Promise<void> {
    await this.stopOllama();
  }

  /**
   * Check if Ollama is running
   */
  private async isOllamaRunning(): Promise<boolean> {
    try {
      const response = await axios.get(`http://${this.ollamaHost}:${this.ollamaPort}/`, {
        timeout: 2000,
      });
      return response.status === 200;
    } catch {
      return false;
    }
  }

  /**
   * Wait for Ollama to be ready
   */
  private async waitForOllamaReady(timeout: number): Promise<boolean> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      if (await this.isOllamaRunning()) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    return false;
  }

  /**
   * Find Ollama executable
   */
  private async findOllamaExecutable(): Promise<string | null> {
    const possiblePaths = [
      '/usr/local/bin/ollama',
      '/opt/homebrew/bin/ollama',
      '/usr/bin/ollama',
      path.join(os.homedir(), '.ollama', 'bin', 'ollama'),
    ];

    // Add Windows paths
    if (process.platform === 'win32') {
      possiblePaths.push(
        'C:\\Program Files\\Ollama\\ollama.exe',
        'C:\\Program Files (x86)\\Ollama\\ollama.exe',
        path.join(os.homedir(), 'AppData', 'Local', 'Ollama', 'ollama.exe')
      );
    }

    for (const execPath of possiblePaths) {
      try {
        await fs.access(execPath);
        return execPath;
      } catch {
        continue;
      }
    }

    // Try to find in PATH
    try {
      const which = process.platform === 'win32' ? 'where' : 'which';
      const result = await this.execCommand(which, ['ollama']);
      return result.stdout.trim().split('\n')[0];
    } catch {
      return null;
    }
  }

  /**
   * Make a request to Ollama API
   */
  private async makeOllamaRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `http://${this.ollamaHost}:${this.ollamaPort}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      timeout: 10000,
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Normalize Ollama model data
   */
  private normalizeModel(model: any): LocalModel {
    return {
      name: model.name,
      size: model.size,
      modified: new Date(model.modified_at),
      digest: model.digest,
      details: {
        family: model.details?.family || 'unknown',
        parameter_size: model.details?.parameter_size || 'unknown',
        quantization_level: model.details?.quantization_level || 'unknown',
      },
    };
  }

  /**
   * Execute a command
   */
  private async execCommand(command: string, args: string[]): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, { stdio: ['pipe', 'pipe', 'pipe'] });
      
      let stdout = '';
      let stderr = '';
      
      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });
      
      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });
      
      child.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr });
        } else {
          reject(new Error(`Command failed with code ${code}: ${stderr}`));
        }
      });
      
      child.on('error', reject);
    });
  }
} 