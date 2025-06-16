// packages/database/src/services/analytics.ts
// Analytics database service operations

import { getNeonClient, extractFirstRow, extractRows } from '../client';
import type { DatabaseConfig } from '@omnipanel/config';

// Basic analytics interfaces
export interface AnalyticsEvent {
  id: string;
  event_type: string;
  user_id?: string;
  session_id?: string;
  properties: Record<string, unknown>;
  timestamp: string;
}

export interface AnalyticsMetrics {
  total_events: number;
  unique_users: number;
  sessions: number;
  page_views: number;
}

export interface PageMetrics {
  page: string;
  views: number;
  unique_visitors: number;
  bounce_rate: number;
}

export class AnalyticsService {
  private client: ReturnType<typeof getNeonClient>;

  constructor(config?: DatabaseConfig) {
    this.client = getNeonClient(config);
  }

  // Event tracking
  async trackEvent(eventData: Omit<AnalyticsEvent, 'id' | 'timestamp'>): Promise<AnalyticsEvent> {
    const result = await this.client(
      `INSERT INTO analytics_events (event_type, user_id, session_id, properties)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        eventData.event_type,
        eventData.user_id,
        eventData.session_id,
        JSON.stringify(eventData.properties)
      ]
    );
    return extractFirstRow(result) as unknown as AnalyticsEvent;
  }

  // Basic metrics
  async getBasicMetrics(startDate: string, endDate: string): Promise<AnalyticsMetrics> {
    const result = await this.client(
      `SELECT 
         COUNT(*) as total_events,
         COUNT(DISTINCT user_id) as unique_users,
         COUNT(DISTINCT session_id) as sessions,
         COUNT(*) FILTER (WHERE event_type = 'page_view') as page_views
       FROM analytics_events 
       WHERE timestamp >= $1 AND timestamp <= $2`,
      [startDate, endDate]
    );
    
    const row = extractFirstRow(result) as any;
    return {
      total_events: parseInt(row?.total_events || '0'),
      unique_users: parseInt(row?.unique_users || '0'),
      sessions: parseInt(row?.sessions || '0'),
      page_views: parseInt(row?.page_views || '0')
    };
  }

  // Page analytics
  async getPageMetrics(startDate: string, endDate: string, limit = 10): Promise<PageMetrics[]> {
    const result = await this.client(
      `SELECT 
         properties->>'page' as page,
         COUNT(*) as views,
         COUNT(DISTINCT user_id) as unique_visitors,
         ROUND(
           COUNT(*) FILTER (WHERE properties->>'bounce' = 'true')::numeric / 
           COUNT(*)::numeric * 100, 2
         ) as bounce_rate
       FROM analytics_events 
       WHERE event_type = 'page_view' 
         AND timestamp >= $1 AND timestamp <= $2
         AND properties->>'page' IS NOT NULL
       GROUP BY properties->>'page'
       ORDER BY views DESC
       LIMIT $3`,
      [startDate, endDate, limit]
    );
    
    return extractRows(result).map((row: Record<string, unknown>) => ({
      page: row.page as string,
      views: parseInt(row.views as string),
      unique_visitors: parseInt(row.unique_visitors as string),
      bounce_rate: parseFloat(row.bounce_rate as string)
    }));
  }

  // User analytics
  async getUserActivity(userId: string, limit = 50): Promise<AnalyticsEvent[]> {
    const result = await this.client(
      'SELECT * FROM analytics_events WHERE user_id = $1 ORDER BY timestamp DESC LIMIT $2',
      [userId, limit]
    );
    return extractRows(result) as unknown as AnalyticsEvent[];
  }

  // Session analytics
  async getSessionEvents(sessionId: string): Promise<AnalyticsEvent[]> {
    const result = await this.client(
      'SELECT * FROM analytics_events WHERE session_id = $1 ORDER BY timestamp ASC',
      [sessionId]
    );
    return extractRows(result) as unknown as AnalyticsEvent[];
  }

  // Real-time metrics
  async getRealTimeMetrics(): Promise<{
    active_users: number;
    events_last_hour: number;
    top_pages: PageMetrics[];
  }> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const activeUsersResult = await this.client(
      'SELECT COUNT(DISTINCT user_id) as active_users FROM analytics_events WHERE timestamp >= $1',
      [oneHourAgo]
    );
    
    const eventsResult = await this.client(
      'SELECT COUNT(*) as events_count FROM analytics_events WHERE timestamp >= $1',
      [oneHourAgo]
    );
    
    const topPagesResult = await this.client(
      `SELECT 
         properties->>'page' as page,
         COUNT(*) as views,
         COUNT(DISTINCT user_id) as unique_visitors,
         0 as bounce_rate
       FROM analytics_events 
       WHERE event_type = 'page_view' 
         AND timestamp >= $1
         AND properties->>'page' IS NOT NULL
       GROUP BY properties->>'page'
       ORDER BY views DESC
       LIMIT 5`,
      [oneHourAgo]
    );
    
    const activeUsers = extractFirstRow(activeUsersResult) as any;
    const events = extractFirstRow(eventsResult) as any;
    const topPages = extractRows(topPagesResult);
    
    return {
      active_users: parseInt(activeUsers?.active_users || '0'),
      events_last_hour: parseInt(events?.events_count || '0'),
      top_pages: topPages.map((row: Record<string, unknown>) => ({
        page: row.page as string,
        views: parseInt(row.views as string),
        unique_visitors: parseInt(row.unique_visitors as string),
        bounce_rate: 0
      }))
    };
  }

  // Event search
  async searchEvents(
    query: string,
    eventType?: string,
    userId?: string,
    startDate?: string,
    endDate?: string,
    limit = 100
  ): Promise<AnalyticsEvent[]> {
    let sql = `
      SELECT * FROM analytics_events
      WHERE (properties::text ILIKE $1 OR event_type ILIKE $1)
    `;
    const params: (string | number)[] = [`%${query}%`];

    if (eventType) {
      sql += ` AND event_type = $${params.length + 1}`;
      params.push(eventType);
    }

    if (userId) {
      sql += ` AND user_id = $${params.length + 1}`;
      params.push(userId);
    }

    if (startDate) {
      sql += ` AND timestamp >= $${params.length + 1}`;
      params.push(startDate);
    }

    if (endDate) {
      sql += ` AND timestamp <= $${params.length + 1}`;
      params.push(endDate);
    }

    sql += ` ORDER BY timestamp DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await this.client(sql, params);
    return extractRows(result) as unknown as AnalyticsEvent[];
  }
} 