// packages/llm-adapters/src/utils/rateLimiter.ts

import { ProviderError, ProviderErrorType } from '@omnipanel/types';

export interface RateLimitConfig {
  requestsPerMinute?: number;
  requestsPerHour?: number;
  requestsPerDay?: number;
  tokensPerMinute?: number;
  tokensPerHour?: number;
  tokensPerDay?: number;
  burstAllowance?: number;
  queueMaxSize?: number;
  queueTimeout?: number;
}

export interface RateLimitStatus {
  requestsRemaining: {
    perMinute: number;
    perHour: number;
    perDay: number;
  };
  tokensRemaining: {
    perMinute: number;
    perHour: number;
    perDay: number;
  };
  resetTimes: {
    nextMinute: Date;
    nextHour: Date;
    nextDay: Date;
  };
  queueSize: number;
  isBlocked: boolean;
}

interface RequestRecord {
  timestamp: number;
  tokens?: number;
}

interface QueuedRequest {
  resolve: () => void;
  reject: (error: Error) => void;
  timestamp: number;
  tokens?: number;
}

export class RateLimiter {
  private requests: RequestRecord[] = [];
  private queue: QueuedRequest[] = [];
  private config: Required<RateLimitConfig>;

  constructor(config: RateLimitConfig = {}) {
    this.config = {
      requestsPerMinute: config.requestsPerMinute ?? 60,
      requestsPerHour: config.requestsPerHour ?? 3600,
      requestsPerDay: config.requestsPerDay ?? 86400,
      tokensPerMinute: config.tokensPerMinute ?? 150000,
      tokensPerHour: config.tokensPerHour ?? 9000000,
      tokensPerDay: config.tokensPerDay ?? 216000000,
      burstAllowance: config.burstAllowance ?? 10,
      queueMaxSize: config.queueMaxSize ?? 100,
      queueTimeout: config.queueTimeout ?? 30000 // 30 seconds
    };
  }

  /**
   * Wait for availability and consume rate limit quota
   */
  async waitForAvailability(tokens?: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const queuedRequest: QueuedRequest = {
        resolve,
        reject,
        timestamp: Date.now(),
        tokens
      };

      // Check if we can process immediately
      if (this.canProcessRequest(tokens)) {
        this.recordRequest(tokens);
        resolve();
        return;
      }

      // Add to queue if there's space
      if (this.queue.length >= this.config.queueMaxSize) {
        reject(new ProviderError(
          'Rate limit queue is full',
          ProviderErrorType.RATE_LIMIT_ERROR,
          { queueSize: this.queue.length, maxSize: this.config.queueMaxSize }
        ));
        return;
      }

      this.queue.push(queuedRequest);

      // Set timeout for queued request
      setTimeout(() => {
        const index = this.queue.indexOf(queuedRequest);
        if (index !== -1) {
          this.queue.splice(index, 1);
          reject(new ProviderError(
            'Rate limit queue timeout',
            ProviderErrorType.TIMEOUT,
            { queueTimeout: this.config.queueTimeout }
          ));
        }
      }, this.config.queueTimeout);

      // Process queue
      this.processQueue();
    });
  }

  /**
   * Check if a request can be processed immediately
   */
  canProcessRequest(tokens?: number): boolean {
    this.cleanupOldRequests();

    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const oneHourAgo = now - 3600000;
    const oneDayAgo = now - 86400000;

    // Count requests and tokens in each time window
    const requestsLastMinute = this.requests.filter(r => r.timestamp > oneMinuteAgo).length;
    const requestsLastHour = this.requests.filter(r => r.timestamp > oneHourAgo).length;
    const requestsLastDay = this.requests.filter(r => r.timestamp > oneDayAgo).length;

    const tokensLastMinute = this.requests
      .filter(r => r.timestamp > oneMinuteAgo)
      .reduce((sum, r) => sum + (r.tokens || 0), 0);
    
    const tokensLastHour = this.requests
      .filter(r => r.timestamp > oneHourAgo)
      .reduce((sum, r) => sum + (r.tokens || 0), 0);
    
    const tokensLastDay = this.requests
      .filter(r => r.timestamp > oneDayAgo)
      .reduce((sum, r) => sum + (r.tokens || 0), 0);

    // Check request limits
    if (requestsLastMinute >= this.config.requestsPerMinute) return false;
    if (requestsLastHour >= this.config.requestsPerHour) return false;
    if (requestsLastDay >= this.config.requestsPerDay) return false;

    // Check token limits if tokens are specified
    if (tokens) {
      if (tokensLastMinute + tokens > this.config.tokensPerMinute) return false;
      if (tokensLastHour + tokens > this.config.tokensPerHour) return false;
      if (tokensLastDay + tokens > this.config.tokensPerDay) return false;
    }

    return true;
  }

  /**
   * Record a successful request
   */
  recordRequest(tokens?: number): void {
    this.requests.push({
      timestamp: Date.now(),
      tokens
    });
  }

  /**
   * Get current rate limit status
   */
  getStatus(): RateLimitStatus {
    this.cleanupOldRequests();

    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const oneHourAgo = now - 3600000;
    const oneDayAgo = now - 86400000;

    const requestsLastMinute = this.requests.filter(r => r.timestamp > oneMinuteAgo).length;
    const requestsLastHour = this.requests.filter(r => r.timestamp > oneHourAgo).length;
    const requestsLastDay = this.requests.filter(r => r.timestamp > oneDayAgo).length;

    const tokensLastMinute = this.requests
      .filter(r => r.timestamp > oneMinuteAgo)
      .reduce((sum, r) => sum + (r.tokens || 0), 0);
    
    const tokensLastHour = this.requests
      .filter(r => r.timestamp > oneHourAgo)
      .reduce((sum, r) => sum + (r.tokens || 0), 0);
    
    const tokensLastDay = this.requests
      .filter(r => r.timestamp > oneDayAgo)
      .reduce((sum, r) => sum + (r.tokens || 0), 0);

    const nextMinute = new Date(Math.ceil(now / 60000) * 60000);
    const nextHour = new Date(Math.ceil(now / 3600000) * 3600000);
    const nextDay = new Date(Math.ceil(now / 86400000) * 86400000);

    return {
      requestsRemaining: {
        perMinute: Math.max(0, this.config.requestsPerMinute - requestsLastMinute),
        perHour: Math.max(0, this.config.requestsPerHour - requestsLastHour),
        perDay: Math.max(0, this.config.requestsPerDay - requestsLastDay)
      },
      tokensRemaining: {
        perMinute: Math.max(0, this.config.tokensPerMinute - tokensLastMinute),
        perHour: Math.max(0, this.config.tokensPerHour - tokensLastHour),
        perDay: Math.max(0, this.config.tokensPerDay - tokensLastDay)
      },
      resetTimes: {
        nextMinute,
        nextHour,
        nextDay
      },
      queueSize: this.queue.length,
      isBlocked: !this.canProcessRequest()
    };
  }

  /**
   * Estimate wait time until next available slot
   */
  estimateWaitTime(tokens?: number): number {
    if (this.canProcessRequest(tokens)) {
      return 0;
    }

    const now = Date.now();
    const status = this.getStatus();

    // Find the most restrictive limit and when it resets
    const waitTimes: number[] = [];

    if (status.requestsRemaining.perMinute === 0) {
      waitTimes.push(status.resetTimes.nextMinute.getTime() - now);
    }
    if (status.requestsRemaining.perHour === 0) {
      waitTimes.push(status.resetTimes.nextHour.getTime() - now);
    }
    if (status.requestsRemaining.perDay === 0) {
      waitTimes.push(status.resetTimes.nextDay.getTime() - now);
    }

    if (tokens) {
      if (status.tokensRemaining.perMinute < tokens) {
        waitTimes.push(status.resetTimes.nextMinute.getTime() - now);
      }
      if (status.tokensRemaining.perHour < tokens) {
        waitTimes.push(status.resetTimes.nextHour.getTime() - now);
      }
      if (status.tokensRemaining.perDay < tokens) {
        waitTimes.push(status.resetTimes.nextDay.getTime() - now);
      }
    }

    return Math.min(...waitTimes, 60000); // Max 1 minute wait
  }

  /**
   * Update rate limits from API response headers
   */
  updateFromHeaders(headers: Headers | Record<string, string>): void {
    const getHeader = (name: string): string | null => {
      if (headers instanceof Headers) {
        return headers.get(name);
      }
      return headers[name] || headers[name.toLowerCase()] || null;
    };

    // OpenAI-style headers
    const requestsRemaining = getHeader('x-ratelimit-remaining-requests');
    const tokensRemaining = getHeader('x-ratelimit-remaining-tokens');
    const requestsReset = getHeader('x-ratelimit-reset-requests');
    const tokensReset = getHeader('x-ratelimit-reset-tokens');

    // Anthropic-style headers
    const requestLimit = getHeader('anthropic-ratelimit-requests-limit');
    const requestRemaining = getHeader('anthropic-ratelimit-requests-remaining');
    const tokenLimit = getHeader('anthropic-ratelimit-tokens-limit');
    const tokenRemaining = getHeader('anthropic-ratelimit-tokens-remaining');

    // Update internal tracking based on headers
    if (requestsRemaining || tokensRemaining) {
      // Adjust internal state to match API reported limits
      this.adjustInternalState({
        requestsRemaining: requestsRemaining ? parseInt(requestsRemaining) : undefined,
        tokensRemaining: tokensRemaining ? parseInt(tokensRemaining) : undefined,
        requestsReset: requestsReset ? new Date(requestsReset) : undefined,
        tokensReset: tokensReset ? new Date(tokensReset) : undefined
      });
    }
  }

  /**
   * Reset rate limiter state
   */
  reset(): void {
    this.requests = [];
    this.queue.forEach(req => {
      req.reject(new Error('Rate limiter reset'));
    });
    this.queue = [];
  }

  /**
   * Process queued requests
   */
  private processQueue(): void {
    if (this.queue.length === 0) return;

    setTimeout(() => {
      while (this.queue.length > 0) {
        const request = this.queue[0];
        
        if (this.canProcessRequest(request.tokens)) {
          this.queue.shift();
          this.recordRequest(request.tokens);
          request.resolve();
        } else {
          break;
        }
      }

      // Continue processing if there are still queued requests
      if (this.queue.length > 0) {
        this.processQueue();
      }
    }, 100); // Check every 100ms
  }

  /**
   * Clean up old request records
   */
  private cleanupOldRequests(): void {
    const cutoff = Date.now() - 86400000; // 24 hours ago
    this.requests = this.requests.filter(r => r.timestamp > cutoff);
  }

  /**
   * Adjust internal state based on API headers
   */
  private adjustInternalState(limits: {
    requestsRemaining?: number;
    tokensRemaining?: number;
    requestsReset?: Date;
    tokensReset?: Date;
  }): void {
    // This is a simplified adjustment - in production you might want
    // more sophisticated synchronization with API-reported limits
    const now = Date.now();
    
    if (limits.requestsRemaining !== undefined && limits.requestsRemaining === 0) {
      // If API says no requests remaining, ensure we respect that
      const oneMinuteAgo = now - 60000;
      const recentRequests = this.requests.filter(r => r.timestamp > oneMinuteAgo).length;
      
      if (recentRequests < this.config.requestsPerMinute) {
        // Add artificial requests to match API state
        const toAdd = this.config.requestsPerMinute - recentRequests;
        for (let i = 0; i < toAdd; i++) {
          this.requests.push({ timestamp: now - (i * 1000) });
        }
      }
    }
  }
}

/**
 * Global rate limiter instances for different providers
 */
export class RateLimiterManager {
  private static limiters = new Map<string, RateLimiter>();

  static getLimiter(providerId: string, config?: RateLimitConfig): RateLimiter {
    if (!this.limiters.has(providerId)) {
      this.limiters.set(providerId, new RateLimiter(config));
    }
    return this.limiters.get(providerId)!;
  }

  static removeLimiter(providerId: string): void {
    const limiter = this.limiters.get(providerId);
    if (limiter) {
      limiter.reset();
      this.limiters.delete(providerId);
    }
  }

  static getAllStatus(): Record<string, RateLimitStatus> {
    const status: Record<string, RateLimitStatus> = {};
    for (const [providerId, limiter] of this.limiters.entries()) {
      status[providerId] = limiter.getStatus();
    }
    return status;
  }

  static resetAll(): void {
    for (const limiter of this.limiters.values()) {
      limiter.reset();
    }
    this.limiters.clear();
  }
}