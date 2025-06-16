// packages/llm-adapters/src/streaming/StreamingManager.ts
// Simple streaming manager for LLM responses

export interface StreamingOptions {
  onToken?: (token: string) => void;
  onComplete?: (fullResponse: string) => void;
  onError?: (error: Error) => void;
}

export class StreamingManager {
  private activeStreams: Map<string, AbortController> = new Map();

  /**
   * Start a streaming session
   */
  startStream(streamId: string, options: StreamingOptions = {}): AbortController {
    // Cancel any existing stream with the same ID
    this.cancelStream(streamId);

    const controller = new AbortController();
    this.activeStreams.set(streamId, controller);

    return controller;
  }

  /**
   * Cancel a specific stream
   */
  cancelStream(streamId: string): void {
    const controller = this.activeStreams.get(streamId);
    if (controller) {
      controller.abort();
      this.activeStreams.delete(streamId);
    }
  }

  /**
   * Cancel all active streams
   */
  cancelAllStreams(): void {
    for (const [streamId, controller] of this.activeStreams) {
      controller.abort();
    }
    this.activeStreams.clear();
  }

  /**
   * Check if a stream is active
   */
  isStreamActive(streamId: string): boolean {
    const controller = this.activeStreams.get(streamId);
    return controller ? !controller.signal.aborted : false;
  }

  /**
   * Get the number of active streams
   */
  getActiveStreamCount(): number {
    return this.activeStreams.size;
  }

  /**
   * Process streaming response
   */
  async processStream(
    streamId: string,
    response: Response,
    options: StreamingOptions = {}
  ): Promise<string> {
    const controller = this.activeStreams.get(streamId);
    if (!controller) {
      throw new Error(`Stream ${streamId} not found`);
    }

    if (!response.body) {
      throw new Error('Response body is null');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';

    try {
      while (true) {
        if (controller.signal.aborted) {
          throw new Error('Stream was cancelled');
        }

        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        fullResponse += chunk;

        if (options.onToken) {
          options.onToken(chunk);
        }
      }

      if (options.onComplete) {
        options.onComplete(fullResponse);
      }

      return fullResponse;
    } catch (error) {
      if (options.onError) {
        options.onError(error as Error);
      }
      throw error;
    } finally {
      this.activeStreams.delete(streamId);
    }
  }
} 