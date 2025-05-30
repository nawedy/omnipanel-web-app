// packages/llm-adapters/src/utils/costTracker.ts

import { AIProvider, TokenUsage, createTokenUsageFromNew } from '@omnipanel/types';

export interface CostTrackerConfig {
  provider: AIProvider;
  inputTokenCost?: number;
  outputTokenCost?: number;
  cacheReadCost?: number;
  cacheWriteCost?: number;
  currency?: string;
  trackingEnabled?: boolean;
}

export interface CostBreakdown {
  inputTokens: number;
  outputTokens: number;
  cacheTokensRead: number;
  cacheTokensWrite: number;
  inputCost: number;
  outputCost: number;
  cacheCost: number;
  totalCost: number;
  currency: string;
}

export interface UsageStats {
  provider: AIProvider;
  totalRequests: number;
  totalTokens: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCacheTokensRead: number;
  totalCacheTokensWrite: number;
  totalCost: number;
  averageCostPerRequest: number;
  averageTokensPerRequest: number;
  costBreakdown: {
    input: number;
    output: number;
    cache: number;
  };
  currency: string;
  trackingPeriod: {
    start: Date;
    end: Date;
    durationMs: number;
  };
  dailyStats: DailyStats[];
  requestHistory: RequestRecord[];
}

export interface DailyStats {
  date: string;
  requests: number;
  tokens: number;
  cost: number;
}

export interface RequestRecord {
  timestamp: Date;
  tokens: TokenUsage;
  cost: number;
  model?: string;
  requestId?: string;
}

export interface CostAlert {
  type: 'daily' | 'monthly' | 'total';
  threshold: number;
  current: number;
  currency: string;
  triggered: boolean;
  message: string;
}

export class CostTracker {
  private config: Required<CostTrackerConfig>;
  private requests: RequestRecord[] = [];
  private startTime: Date;
  private alerts: CostAlert[] = [];

  constructor(config: CostTrackerConfig) {
    this.config = {
      inputTokenCost: config.inputTokenCost ?? 0,
      outputTokenCost: config.outputTokenCost ?? 0,
      cacheReadCost: config.cacheReadCost ?? 0,
      cacheWriteCost: config.cacheWriteCost ?? 0,
      currency: config.currency ?? 'USD',
      trackingEnabled: config.trackingEnabled ?? true,
      ...config
    };
    this.startTime = new Date();
  }

  /**
   * Track usage for a request
   */
  async trackUsage(
    usage: TokenUsage, 
    cost?: number, 
    metadata?: { model?: string; requestId?: string }
  ): Promise<CostBreakdown> {
    if (!this.config.trackingEnabled) {
      return this.createEmptyCostBreakdown();
    }

    const breakdown = this.calculateCost(usage, cost);
    
    const record: RequestRecord = {
      timestamp: new Date(),
      tokens: usage,
      cost: breakdown.totalCost,
      model: metadata?.model,
      requestId: metadata?.requestId
    };

    this.requests.push(record);
    this.checkAlerts();
    this.cleanup();

    return breakdown;
  }

  /**
   * Calculate cost breakdown for token usage
   */
  calculateCost(usage: TokenUsage, providedCost?: number): CostBreakdown {
    if (providedCost !== undefined) {
      return {
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        cacheTokensRead: usage.cacheTokensRead || 0,
        cacheTokensWrite: usage.cacheTokensWrite || 0,
        inputCost: 0,
        outputCost: 0,
        cacheCost: 0,
        totalCost: providedCost,
        currency: this.config.currency
      };
    }

    const inputCost = (usage.inputTokens / 1000000) * this.config.inputTokenCost;
    const outputCost = (usage.outputTokens / 1000000) * this.config.outputTokenCost;
    
    const cacheReadCost = ((usage.cacheTokensRead || 0) / 1000000) * this.config.cacheReadCost;
    const cacheWriteCost = ((usage.cacheTokensWrite || 0) / 1000000) * this.config.cacheWriteCost;
    const cacheCost = cacheReadCost + cacheWriteCost;

    return {
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      cacheTokensRead: usage.cacheTokensRead || 0,
      cacheTokensWrite: usage.cacheTokensWrite || 0,
      inputCost,
      outputCost,
      cacheCost,
      totalCost: inputCost + outputCost + cacheCost,
      currency: this.config.currency
    };
  }

  /**
   * Get comprehensive usage statistics
   */
  getStats(): UsageStats {
    const now = new Date();
    const totalRequests = this.requests.length;
    
    if (totalRequests === 0) {
      return this.createEmptyStats(now);
    }

    const totalTokens = this.requests.reduce((sum, r) => sum + r.tokens.totalTokens, 0);
    const totalInputTokens = this.requests.reduce((sum, r) => sum + r.tokens.inputTokens, 0);
    const totalOutputTokens = this.requests.reduce((sum, r) => sum + r.tokens.outputTokens, 0);
    const totalCacheTokensRead = this.requests.reduce((sum, r) => sum + (r.tokens.cacheTokensRead || 0), 0);
    const totalCacheTokensWrite = this.requests.reduce((sum, r) => sum + (r.tokens.cacheTokensWrite || 0), 0);
    const totalCost = this.requests.reduce((sum, r) => sum + r.cost, 0);

    const inputCost = this.requests.reduce((sum, r) => {
      const breakdown = this.calculateCost(r.tokens, r.cost);
      return sum + breakdown.inputCost;
    }, 0);

    const outputCost = this.requests.reduce((sum, r) => {
      const breakdown = this.calculateCost(r.tokens, r.cost);
      return sum + breakdown.outputCost;
    }, 0);

    const cacheCost = this.requests.reduce((sum, r) => {
      const breakdown = this.calculateCost(r.tokens, r.cost);
      return sum + breakdown.cacheCost;
    }, 0);

    return {
      provider: this.config.provider,
      totalRequests,
      totalTokens,
      totalInputTokens,
      totalOutputTokens,
      totalCacheTokensRead,
      totalCacheTokensWrite,
      totalCost,
      averageCostPerRequest: totalCost / totalRequests,
      averageTokensPerRequest: totalTokens / totalRequests,
      costBreakdown: {
        input: inputCost,
        output: outputCost,
        cache: cacheCost
      },
      currency: this.config.currency,
      trackingPeriod: {
        start: this.startTime,
        end: now,
        durationMs: now.getTime() - this.startTime.getTime()
      },
      dailyStats: this.calculateDailyStats(),
      requestHistory: [...this.requests].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    };
  }

  /**
   * Get cost statistics for a specific time period
   */
  getStatsForPeriod(startDate: Date, endDate: Date): UsageStats {
    const filteredRequests = this.requests.filter(
      r => r.timestamp >= startDate && r.timestamp <= endDate
    );

    const originalRequests = this.requests;
    this.requests = filteredRequests;
    
    const stats = this.getStats();
    stats.trackingPeriod = {
      start: startDate,
      end: endDate,
      durationMs: endDate.getTime() - startDate.getTime()
    };

    this.requests = originalRequests;
    return stats;
  }

  /**
   * Get today's usage statistics
   */
  getTodayStats(): UsageStats {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.getStatsForPeriod(today, tomorrow);
  }

  /**
   * Get this month's usage statistics
   */
  getMonthStats(): UsageStats {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    return this.getStatsForPeriod(startOfMonth, endOfMonth);
  }

  /**
   * Set cost alert thresholds
   */
  setAlert(type: 'daily' | 'monthly' | 'total', threshold: number): void {
    const existingAlert = this.alerts.find(alert => alert.type === type);
    
    if (existingAlert) {
      existingAlert.threshold = threshold;
      existingAlert.triggered = false;
    } else {
      this.alerts.push({
        type,
        threshold,
        current: 0,
        currency: this.config.currency,
        triggered: false,
        message: ''
      });
    }
  }

  /**
   * Get current alert status
   */
  getAlerts(): CostAlert[] {
    return [...this.alerts];
  }

  /**
   * Export usage data for external analysis
   */
  exportData(format: 'json' | 'csv' = 'json'): string {
    const stats = this.getStats();

    if (format === 'csv') {
      const headers = [
        'timestamp',
        'inputTokens',
        'outputTokens',
        'totalTokens',
        'cost',
        'model',
        'requestId'
      ];

      const rows = this.requests.map(r => [
        r.timestamp.toISOString(),
        r.tokens.inputTokens.toString(),
        r.tokens.outputTokens.toString(),
        r.tokens.totalTokens.toString(),
        r.cost.toFixed(6),
        r.model || '',
        r.requestId || ''
      ]);

      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    return JSON.stringify(stats, null, 2);
  }

  /**
   * Import usage data from external source
   */
  importData(data: string, format: 'json' | 'csv' = 'json'): void {
    if (format === 'csv') {
      const lines = data.trim().split('\n');
      const headers = lines[0].split(',');
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const record: RequestRecord = {
          timestamp: new Date(values[0]),
          tokens: createTokenUsageFromNew(
            parseInt(values[1]),
            parseInt(values[2]),
            parseInt(values[3])
          ),
          cost: parseFloat(values[4]),
          model: values[5] || undefined,
          requestId: values[6] || undefined
        };
        this.requests.push(record);
      }
    } else {
      const importedStats: UsageStats = JSON.parse(data);
      this.requests.push(...importedStats.requestHistory);
    }

    this.cleanup();
  }

  /**
   * Reset all tracking data
   */
  reset(): void {
    this.requests = [];
    this.startTime = new Date();
    this.alerts.forEach(alert => {
      alert.triggered = false;
      alert.current = 0;
    });
  }

  /**
   * Update cost configuration
   */
  updateConfig(config: Partial<CostTrackerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get estimated cost for a planned request
   */
  estimateCost(estimatedTokens: TokenUsage): CostBreakdown {
    return this.calculateCost(estimatedTokens);
  }

  /**
   * Check if any cost alerts should be triggered
   */
  private checkAlerts(): void {
    for (const alert of this.alerts) {
      let currentCost = 0;

      switch (alert.type) {
        case 'daily':
          currentCost = this.getTodayStats().totalCost;
          break;
        case 'monthly':
          currentCost = this.getMonthStats().totalCost;
          break;
        case 'total':
          currentCost = this.getStats().totalCost;
          break;
      }

      alert.current = currentCost;

      if (currentCost >= alert.threshold && !alert.triggered) {
        alert.triggered = true;
        alert.message = `${alert.type} cost threshold exceeded: ${currentCost.toFixed(4)} ${alert.currency} >= ${alert.threshold} ${alert.currency}`;
        
        // In a real application, you might want to emit an event or call a callback here
        console.warn(`Cost Alert: ${alert.message}`);
      }
    }
  }

  /**
   * Calculate daily statistics
   */
  private calculateDailyStats(): DailyStats[] {
    const dailyMap = new Map<string, { requests: number; tokens: number; cost: number }>();

    for (const request of this.requests) {
      const dateKey = request.timestamp.toISOString().split('T')[0];
      const existing = dailyMap.get(dateKey) || { requests: 0, tokens: 0, cost: 0 };
      
      existing.requests++;
      existing.tokens += request.tokens.totalTokens;
      existing.cost += request.cost;
      
      dailyMap.set(dateKey, existing);
    }

    return Array.from(dailyMap.entries())
      .map(([date, stats]) => ({ date, ...stats }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Clean up old request records to prevent memory leaks
   */
  private cleanup(): void {
    const maxRecords = 10000;
    const maxAge = 90 * 24 * 60 * 60 * 1000; // 90 days
    const cutoff = new Date(Date.now() - maxAge);

    // Remove old records
    this.requests = this.requests.filter(r => r.timestamp > cutoff);

    // Limit total records
    if (this.requests.length > maxRecords) {
      this.requests = this.requests
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, maxRecords);
    }
  }

  /**
   * Create empty cost breakdown
   */
  private createEmptyCostBreakdown(): CostBreakdown {
    return {
      inputTokens: 0,
      outputTokens: 0,
      cacheTokensRead: 0,
      cacheTokensWrite: 0,
      inputCost: 0,
      outputCost: 0,
      cacheCost: 0,
      totalCost: 0,
      currency: this.config.currency
    };
  }

  /**
   * Create empty usage stats
   */
  private createEmptyStats(now: Date): UsageStats {
    return {
      provider: this.config.provider,
      totalRequests: 0,
      totalTokens: 0,
      totalInputTokens: 0,
      totalOutputTokens: 0,
      totalCacheTokensRead: 0,
      totalCacheTokensWrite: 0,
      totalCost: 0,
      averageCostPerRequest: 0,
      averageTokensPerRequest: 0,
      costBreakdown: {
        input: 0,
        output: 0,
        cache: 0
      },
      currency: this.config.currency,
      trackingPeriod: {
        start: this.startTime,
        end: now,
        durationMs: now.getTime() - this.startTime.getTime()
      },
      dailyStats: [],
      requestHistory: []
    };
  }
}

/**
 * Global cost tracker manager for multiple providers
 */
export class CostTrackerManager {
  private static trackers = new Map<string, CostTracker>();

  static getTracker(providerId: string, config?: CostTrackerConfig): CostTracker {
    if (!this.trackers.has(providerId)) {
      if (!config) {
        throw new Error(`No cost tracker config provided for provider: ${providerId}`);
      }
      this.trackers.set(providerId, new CostTracker(config));
    }
    return this.trackers.get(providerId)!;
  }

  static removeTracker(providerId: string): void {
    this.trackers.delete(providerId);
  }

  static getAllStats(): Record<string, UsageStats> {
    const stats: Record<string, UsageStats> = {};
    for (const [providerId, tracker] of this.trackers.entries()) {
      stats[providerId] = tracker.getStats();
    }
    return stats;
  }

  static getTotalCost(): number {
    let total = 0;
    for (const tracker of this.trackers.values()) {
      total += tracker.getStats().totalCost;
    }
    return total;
  }

  static exportAllData(format: 'json' | 'csv' = 'json'): string {
    const allStats = this.getAllStats();
    
    if (format === 'csv') {
      const headers = [
        'provider',
        'timestamp',
        'inputTokens',
        'outputTokens',
        'totalTokens',
        'cost',
        'model',
        'requestId'
      ];

      const rows: string[][] = [headers];
      
      for (const [providerId, stats] of Object.entries(allStats)) {
        for (const record of stats.requestHistory) {
          rows.push([
            providerId,
            record.timestamp.toISOString(),
            record.tokens.inputTokens.toString(),
            record.tokens.outputTokens.toString(),
            record.tokens.totalTokens.toString(),
            record.cost.toFixed(6),
            record.model || '',
            record.requestId || ''
          ]);
        }
      }

      return rows.map(row => row.join(',')).join('\n');
    }

    return JSON.stringify(allStats, null, 2);
  }

  static resetAll(): void {
    for (const tracker of this.trackers.values()) {
      tracker.reset();
    }
  }
}