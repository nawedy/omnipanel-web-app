// packages/core/src/utils/rate-limiter.ts
import { CoreError, ErrorCodes } from './errors';

export interface RateLimitOptions {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs?: number;
}

export interface RateLimitInfo {
  count: number;
  resetTime: number;
  blocked: boolean;
  blockUntil?: number;
}

/**
 * Basic rate limiter with fixed window
 */
export class RateLimiter {
  private attempts: Map<string, RateLimitInfo> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * Check if operation is within rate limits
   */
  async checkLimit(
    operation: string,
    identifier: string,
    options: RateLimitOptions
  ): Promise<void> {
    const key = `${operation}:${identifier}`;
    const now = Date.now();
    const info = this.attempts.get(key);

    // Check if currently blocked
    if (info?.blocked && info.blockUntil && info.blockUntil > now) {
      throw new CoreError(
        `Too many attempts. Please try again in ${Math.ceil((info.blockUntil - now) / 1000)} seconds`,
        ErrorCodes.RATE_LIMIT_EXCEEDED,
        {
          operation,
          identifier,
          retryAfter: Math.ceil((info.blockUntil - now) / 1000)
        }
      );
    }

    // Initialize or reset if window expired
    if (!info || (now - info.resetTime) >= options.windowMs) {
      this.attempts.set(key, {
        count: 1,
        resetTime: now,
        blocked: false
      });
      return;
    }

    // Increment attempt count
    info.count++;

    // Check if limit exceeded
    if (info.count > options.maxAttempts) {
      const blockDuration = options.blockDurationMs || options.windowMs;
      info.blocked = true;
      info.blockUntil = now + blockDuration;

      throw new CoreError(
        `Rate limit exceeded. Too many attempts for ${operation}`,
        ErrorCodes.RATE_LIMIT_EXCEEDED,
        {
          operation,
          identifier,
          maxAttempts: options.maxAttempts,
          windowMs: options.windowMs,
          retryAfter: Math.ceil(blockDuration / 1000)
        }
      );
    }

    this.attempts.set(key, info);
  }

  /**
   * Get current rate limit status
   */
  getStatus(operation: string, identifier: string): RateLimitInfo | null {
    const key = `${operation}:${identifier}`;
    return this.attempts.get(key) || null;
  }

  /**
   * Reset rate limit for specific key
   */
  reset(operation: string, identifier: string): void {
    const key = `${operation}:${identifier}`;
    this.attempts.delete(key);
  }

  /**
   * Reset all rate limits
   */
  resetAll(): void {
    this.attempts.clear();
  }

  /**
   * Get remaining attempts
   */
  getRemainingAttempts(
    operation: string,
    identifier: string,
    maxAttempts: number
  ): number {
    const info = this.getStatus(operation, identifier);
    if (!info) return maxAttempts;
    return Math.max(0, maxAttempts - info.count);
  }

  /**
   * Check if identifier is currently blocked
   */
  isBlocked(operation: string, identifier: string): boolean {
    const info = this.getStatus(operation, identifier);
    if (!info || !info.blocked) return false;
    
    const now = Date.now();
    return info.blockUntil ? info.blockUntil > now : false;
  }

  /**
   * Get time until block expires
   */
  getBlockTimeRemaining(operation: string, identifier: string): number {
    const info = this.getStatus(operation, identifier);
    if (!info || !info.blocked || !info.blockUntil) return 0;
    
    const now = Date.now();
    return Math.max(0, info.blockUntil - now);
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, info] of Array.from(this.attempts.entries())) {
      // Remove if window expired and not blocked, or if block expired
      const windowExpired = (now - info.resetTime) >= (5 * 60 * 1000); // 5 minutes
      const blockExpired = info.blocked && info.blockUntil && info.blockUntil <= now;
      
      if ((!info.blocked && windowExpired) || blockExpired) {
        expiredKeys.push(key);
      }
    }

    for (const key of expiredKeys) {
      this.attempts.delete(key);
    }
  }

  /**
   * Destroy rate limiter and cleanup
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.attempts.clear();
  }
}

/**
 * Sliding window rate limiter with more precise control
 */
export class SlidingWindowRateLimiter {
  private windows: Map<string, Array<{ timestamp: number; count: number }>> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60 * 1000); // Clean up every minute
  }

  /**
   * Check sliding window rate limit
   */
  async checkLimit(
    operation: string,
    identifier: string,
    maxRequests: number,
    windowMs: number
  ): Promise<void> {
    const key = `${operation}:${identifier}`;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Get or create window
    let window = this.windows.get(key) || [];
    
    // Remove old entries
    window = window.filter(entry => entry.timestamp > windowStart);
    
    // Count total requests in window
    const totalRequests = window.reduce((sum, entry) => sum + entry.count, 0);

    if (totalRequests >= maxRequests) {
      throw new CoreError(
        `Rate limit exceeded: ${totalRequests}/${maxRequests} requests in ${windowMs}ms window`,
        ErrorCodes.RATE_LIMIT_EXCEEDED,
        {
          operation,
          identifier,
          currentRequests: totalRequests,
          maxRequests,
          windowMs,
          retryAfter: Math.ceil(windowMs / 1000)
        }
      );
    }

    // Add current request
    window.push({ timestamp: now, count: 1 });
    this.windows.set(key, window);
  }

  /**
   * Get current usage in window
   */
  getCurrentUsage(operation: string, identifier: string, windowMs: number): number {
    const key = `${operation}:${identifier}`;
    const now = Date.now();
    const windowStart = now - windowMs;
    const window = this.windows.get(key) || [];

    return window
      .filter(entry => entry.timestamp > windowStart)
      .reduce((sum, entry) => sum + entry.count, 0);
  }

  /**
   * Reset rate limit for specific key
   */
  reset(operation: string, identifier: string): void {
    const key = `${operation}:${identifier}`;
    this.windows.delete(key);
  }

  /**
   * Clean up old entries
   */
  private cleanup(): void {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    for (const [key, window] of Array.from(this.windows.entries())) {
      const filteredWindow = window.filter(entry => (now - entry.timestamp) < maxAge);
      
      if (filteredWindow.length === 0) {
        this.windows.delete(key);
      } else if (filteredWindow.length !== window.length) {
        this.windows.set(key, filteredWindow);
      }
    }
  }

  /**
   * Destroy rate limiter
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.windows.clear();
  }
}

/**
 * Token bucket rate limiter for burst handling
 */
export class TokenBucketRateLimiter {
  private buckets: Map<string, { tokens: number; lastRefill: number }> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60 * 1000);
  }

  /**
   * Check token bucket rate limit
   */
  async checkLimit(
    operation: string,
    identifier: string,
    bucketSize: number,
    refillRate: number, // tokens per second
    tokensRequired: number = 1
  ): Promise<void> {
    const key = `${operation}:${identifier}`;
    const now = Date.now();

    // Get or create bucket
    let bucket = this.buckets.get(key);
    if (!bucket) {
      bucket = { tokens: bucketSize, lastRefill: now };
      this.buckets.set(key, bucket);
    }

    // Refill tokens based on time elapsed
    const timeDelta = (now - bucket.lastRefill) / 1000;
    const tokensToAdd = Math.floor(timeDelta * refillRate);
    
    if (tokensToAdd > 0) {
      bucket.tokens = Math.min(bucketSize, bucket.tokens + tokensToAdd);
      bucket.lastRefill = now;
    }

    // Check if enough tokens available
    if (bucket.tokens < tokensRequired) {
      const waitTime = Math.ceil((tokensRequired - bucket.tokens) / refillRate);
      
      throw new CoreError(
        `Rate limit exceeded: insufficient tokens (${bucket.tokens}/${tokensRequired} required)`,
        ErrorCodes.RATE_LIMIT_EXCEEDED,
        {
          operation,
          identifier,
          availableTokens: bucket.tokens,
          requiredTokens: tokensRequired,
          retryAfter: waitTime
        }
      );
    }

    // Consume tokens
    bucket.tokens -= tokensRequired;
    this.buckets.set(key, bucket);
  }

  /**
   * Get available tokens
   */
  getAvailableTokens(
    operation: string,
    identifier: string,
    bucketSize: number,
    refillRate: number
  ): number {
    const key = `${operation}:${identifier}`;
    const bucket = this.buckets.get(key);
    
    if (!bucket) {
      return bucketSize;
    }

    const now = Date.now();
    const timeDelta = (now - bucket.lastRefill) / 1000;
    const tokensToAdd = Math.floor(timeDelta * refillRate);
    
    return Math.min(bucketSize, bucket.tokens + tokensToAdd);
  }

  /**
   * Reset bucket for specific key
   */
  reset(operation: string, identifier: string, bucketSize: number): void {
    const key = `${operation}:${identifier}`;
    this.buckets.set(key, {
      tokens: bucketSize,
      lastRefill: Date.now()
    });
  }

  /**
   * Clean up old buckets
   */
  private cleanup(): void {
    const now = Date.now();
    const maxAge = 60 * 60 * 1000; // 1 hour

    for (const [key, bucket] of Array.from(this.buckets.entries())) {
      if ((now - bucket.lastRefill) > maxAge) {
        this.buckets.delete(key);
      }
    }
  }

  /**
   * Destroy rate limiter
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.buckets.clear();
  }
}

/**
 * IP-based rate limiter with whitelist support
 */
export class IPRateLimiter extends RateLimiter {
  private whitelist: Set<string> = new Set();
  private blacklist: Set<string> = new Set();

  /**
   * Add IP to whitelist (bypass rate limiting)
   */
  addToWhitelist(ip: string): void {
    this.whitelist.add(ip);
  }

  /**
   * Remove IP from whitelist
   */
  removeFromWhitelist(ip: string): void {
    this.whitelist.delete(ip);
  }

  /**
   * Add IP to blacklist (always blocked)
   */
  addToBlacklist(ip: string): void {
    this.blacklist.add(ip);
  }

  /**
   * Remove IP from blacklist
   */
  removeFromBlacklist(ip: string): void {
    this.blacklist.delete(ip);
  }

  /**
   * Check rate limit with IP filtering
   */
  async checkLimit(
    operation: string,
    identifier: string,
    options: RateLimitOptions
  ): Promise<void> {
    // Check blacklist
    if (this.blacklist.has(identifier)) {
      throw new CoreError(
        'IP address is blocked',
        ErrorCodes.FORBIDDEN,
        { ip: identifier }
      );
    }

    // Skip rate limiting for whitelisted IPs
    if (this.whitelist.has(identifier)) {
      return;
    }

    // Apply normal rate limiting
    return super.checkLimit(operation, identifier, options);
  }

  /**
   * Get whitelist
   */
  getWhitelist(): string[] {
    return Array.from(this.whitelist);
  }

  /**
   * Get blacklist
   */
  getBlacklist(): string[] {
    return Array.from(this.blacklist);
  }
}

/**
 * Rate limiter factory
 */
export class RateLimiterFactory {
  static createBasic(): RateLimiter {
    return new RateLimiter();
  }

  static createSlidingWindow(): SlidingWindowRateLimiter {
    return new SlidingWindowRateLimiter();
  }

  static createTokenBucket(): TokenBucketRateLimiter {
    return new TokenBucketRateLimiter();
  }

  static createIPLimiter(): IPRateLimiter {
    return new IPRateLimiter();
  }
}

/**
 * Common rate limit configurations
 */
export const CommonRateLimits = {
  // Authentication operations
  login: { maxAttempts: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  register: { maxAttempts: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour
  passwordReset: { maxAttempts: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour
  
  // API operations
  apiGeneral: { maxAttempts: 100, windowMs: 60 * 1000 }, // 100 requests per minute
  apiStrict: { maxAttempts: 20, windowMs: 60 * 1000 }, // 20 requests per minute
  
  // File operations
  fileUpload: { maxAttempts: 10, windowMs: 60 * 1000 }, // 10 uploads per minute
  
  // Chat operations
  chatMessage: { maxAttempts: 60, windowMs: 60 * 1000 }, // 60 messages per minute
  
  // Search operations
  search: { maxAttempts: 30, windowMs: 60 * 1000 }, // 30 searches per minute
  
  // Email operations
  emailSend: { maxAttempts: 5, windowMs: 60 * 60 * 1000 }, // 5 emails per hour
};

/**
 * Rate limit middleware creator for Express/Next.js
 */
export function createRateLimitMiddleware(
  rateLimiter: RateLimiter,
  operation: string,
  options: RateLimitOptions,
  identifierFn: (req: any) => string = (req) => req.ip || 'anonymous'
) {
  return async (req: any, res: any, next: any) => {
    try {
      const identifier = identifierFn(req);
      await rateLimiter.checkLimit(operation, identifier, options);
      
      // Add rate limit headers
      const remaining = rateLimiter.getRemainingAttempts(operation, identifier, options.maxAttempts);
      const status = rateLimiter.getStatus(operation, identifier);
      
      res.set({
        'X-RateLimit-Limit': options.maxAttempts.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': status ? new Date(status.resetTime + options.windowMs).toISOString() : ''
      });
      
      next();
    } catch (error) {
      if (error instanceof CoreError && error.code === ErrorCodes.RATE_LIMIT_EXCEEDED) {
        res.status(429).json({
          error: 'Rate limit exceeded',
          message: error.message,
          retryAfter: error.details?.retryAfter || 60
        });
      } else {
        next(error);
      }
    }
  };
}

/**
 * Usage examples and utilities
 */
export const RateLimiterUtils = {
  /**
   * Create a simple rate limiter for API routes
   */
  createApiLimiter: (maxRequests: number = 100, windowMinutes: number = 1) => {
    return new RateLimiter();
  },

  /**
   * Create a rate limiter for authentication operations
   */
  createAuthLimiter: () => {
    return new RateLimiter();
  },

  /**
   * Get common rate limit options
   */
  getCommonLimits: () => CommonRateLimits
};