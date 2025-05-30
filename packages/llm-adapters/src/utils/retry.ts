// packages/llm-adapters/src/utils/retry.ts

import { ProviderError, ProviderErrorType } from '@omnipanel/types';

export interface RetryConfig {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryableErrors?: ProviderErrorType[];
}

export interface RetryAttempt {
  attempt: number;
  totalAttempts: number;
  delay: number;
  error?: Error;
}

export type RetryCallback = (attempt: RetryAttempt) => void;

const DEFAULT_RETRYABLE_ERRORS: ProviderErrorType[] = [
  ProviderErrorType.RATE_LIMIT_ERROR,
  ProviderErrorType.TIMEOUT,
  ProviderErrorType.NETWORK_ERROR,
  ProviderErrorType.API_ERROR
];

const DEFAULT_CONFIG: Required<RetryConfig> = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  backoffMultiplier: 2,
  retryableErrors: DEFAULT_RETRYABLE_ERRORS
};

/**
 * Creates a retry wrapper for async functions with exponential backoff
 */
export function createRetryWrapper<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  config?: Partial<RetryConfig>,
  onRetry?: RetryCallback
): Promise<T> {
  const finalConfig = { ...DEFAULT_CONFIG, maxRetries, ...config };

  return executeWithRetry(fn, finalConfig, onRetry);
}

async function executeWithRetry<T>(
  fn: () => Promise<T>,
  config: Required<RetryConfig>,
  onRetry?: RetryCallback,
  attempt: number = 1
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    // Check if we should retry
    if (attempt >= config.maxRetries || !shouldRetry(error, config.retryableErrors)) {
      throw error;
    }

    // Calculate delay with exponential backoff and jitter
    const baseDelay = Math.min(
      config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1),
      config.maxDelay
    );
    
    // Add jitter (±25% of base delay)
    const jitter = baseDelay * 0.25 * (Math.random() * 2 - 1);
    const delay = Math.max(0, baseDelay + jitter);

    // Call retry callback if provided
    if (onRetry) {
      onRetry({
        attempt,
        totalAttempts: config.maxRetries,
        delay,
        error: error instanceof Error ? error : new Error(String(error))
      });
    }

    // Wait before retrying
    await sleep(delay);

    // Recursive retry
    return executeWithRetry(fn, config, onRetry, attempt + 1);
  }
}

function shouldRetry(error: unknown, retryableErrors: ProviderErrorType[]): boolean {
  if (error instanceof ProviderError) {
    return retryableErrors.includes(error.type);
  }

  // Retry on network-related Node.js errors
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    // Common network error patterns
    if (
      message.includes('timeout') ||
      message.includes('econnreset') ||
      message.includes('econnrefused') ||
      message.includes('enotfound') ||
      message.includes('network') ||
      message.includes('fetch')
    ) {
      return true;
    }
  }

  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry wrapper with custom retry logic
 */
export async function retryWithCondition<T>(
  fn: () => Promise<T>,
  shouldRetryFn: (error: unknown, attempt: number) => boolean,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  onRetry?: RetryCallback
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries || !shouldRetryFn(error, attempt)) {
        throw error;
      }

      const delay = baseDelay * Math.pow(2, attempt - 1);
      
      if (onRetry) {
        onRetry({
          attempt,
          totalAttempts: maxRetries,
          delay,
          error: error instanceof Error ? error : new Error(String(error))
        });
      }

      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Retry wrapper for rate limit specific retries
 */
export async function retryWithRateLimit<T>(
  fn: () => Promise<T>,
  maxRetries: number = 5
): Promise<T> {
  return createRetryWrapper(
    fn,
    maxRetries,
    {
      baseDelay: 2000, // Start with 2 seconds for rate limits
      maxDelay: 60000, // Max 1 minute
      backoffMultiplier: 2.5, // More aggressive backoff for rate limits
      retryableErrors: [ProviderErrorType.RATE_LIMIT_ERROR, ProviderErrorType.API_ERROR]
    }
  );
}

/**
 * Utility to extract retry-after header value
 */
export function getRetryAfterDelay(headers: Headers | Record<string, string>): number | null {
  let retryAfter: string | null = null;
  
  if (headers instanceof Headers) {
    retryAfter = headers.get('retry-after') || headers.get('x-ratelimit-reset-after');
  } else {
    retryAfter = headers['retry-after'] || headers['x-ratelimit-reset-after'] || null;
  }

  if (!retryAfter) return null;

  // Parse as seconds
  const seconds = parseInt(retryAfter, 10);
  if (!isNaN(seconds)) {
    return seconds * 1000; // Convert to milliseconds
  }

  // Parse as HTTP date
  const date = new Date(retryAfter);
  if (!isNaN(date.getTime())) {
    return Math.max(0, date.getTime() - Date.now());
  }

  return null;
}

/**
 * Circuit breaker pattern for preventing cascade failures
 */
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(
    private maxFailures: number = 5,
    private resetTimeout: number = 60000 // 1 minute
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = 'half-open';
      } else {
        throw new ProviderError(
          'Circuit breaker is open',
          ProviderErrorType.API_ERROR,
          { state: this.state, failures: this.failures }
        );
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = 'closed';
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.maxFailures) {
      this.state = 'open';
    }
  }

  getState(): { state: string; failures: number; lastFailureTime: number } {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime
    };
  }

  reset(): void {
    this.failures = 0;
    this.lastFailureTime = 0;
    this.state = 'closed';
  }
}