// omnipanel-core/packages/database/src/services/analytics.ts
// Database services for analytics, attribution, and tracking

import { neonClient } from '../neon-client';
import type {
  AnalyticsEvent,
  AttributionModel,
  CreateAnalyticsEventInput,
  CreateAttributionModelInput,
  AnalyticsQuery,
  AnalyticsMetrics,
  PageMetrics,
  SourceMetrics,
  ConversionFunnel,
  AttributionReport,
  RealTimeMetrics
} from '@omnipanel/types';

export class AnalyticsService {
  // ============================
  // EVENT TRACKING
  // ============================

  async trackEvent(data: CreateAnalyticsEventInput): Promise<AnalyticsEvent> {
    const sql = `
      INSERT INTO analytics_events (
        user_id, session_id, event_type, event_name, page_url,
        page_title, referrer_url, utm_source, utm_medium, utm_campaign,
        utm_term, utm_content, properties, user_agent, ip_address,
        device_type, browser, os
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
      ) RETURNING *
    `;

    const values = [
      data.user_id,
      data.session_id,
      data.event_type,
      data.event_name,
      data.page_url,
      data.page_title,
      data.referrer_url,
      data.utm_source,
      data.utm_medium,
      data.utm_campaign,
      data.utm_term,
      data.utm_content,
      JSON.stringify(data.properties || {}),
      data.user_agent,
      data.ip_address,
      data.device_type,
      data.browser,
      data.os
    ];

    const result = await neonClient.query(sql, values);
    return result.rows[0] as AnalyticsEvent;
  }

  async getEvents(query: AnalyticsQuery): Promise<AnalyticsEvent[]> {
    let sql = 'SELECT * FROM analytics_events WHERE created_at >= $1 AND created_at <= $2';
    const values: any[] = [query.start_date, query.end_date];
    let paramCount = 3;

    // Add filters
    if (query.event_types?.length) {
      sql += ` AND event_type = ANY($${paramCount})`;
      values.push(query.event_types);
      paramCount++;
    }

    if (query.user_ids?.length) {
      sql += ` AND user_id = ANY($${paramCount})`;
      values.push(query.user_ids);
      paramCount++;
    }

    if (query.utm_sources?.length) {
      sql += ` AND utm_source = ANY($${paramCount})`;
      values.push(query.utm_sources);
      paramCount++;
    }

    if (query.utm_mediums?.length) {
      sql += ` AND utm_medium = ANY($${paramCount})`;
      values.push(query.utm_mediums);
      paramCount++;
    }

    if (query.device_types?.length) {
      sql += ` AND device_type = ANY($${paramCount})`;
      values.push(query.device_types);
      paramCount++;
    }

    if (query.countries?.length) {
      sql += ` AND country = ANY($${paramCount})`;
      values.push(query.countries);
      paramCount++;
    }

    sql += ' ORDER BY created_at DESC LIMIT 1000';

    const result = await neonClient.query(sql, values);
    return result.rows as AnalyticsEvent[];
  }

  // ============================
  // ANALYTICS METRICS
  // ============================

  async getAnalyticsMetrics(query: AnalyticsQuery): Promise<AnalyticsMetrics> {
    const sql = `
      SELECT 
        COUNT(*) as total_events,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(DISTINCT session_id) as unique_sessions,
        COUNT(CASE WHEN event_type = 'page_view' THEN 1 END) as page_views,
        ROUND(
          COUNT(CASE WHEN event_type = 'page_view' THEN 1 END)::decimal / 
          NULLIF(COUNT(DISTINCT session_id), 0) * 100, 2
        ) as bounce_rate,
        0 as average_session_duration,
        ROUND(
          COUNT(CASE WHEN event_type = 'conversion' THEN 1 END)::decimal / 
          NULLIF(COUNT(DISTINCT session_id), 0) * 100, 2
        ) as conversion_rate
      FROM analytics_events 
      WHERE created_at >= $1 AND created_at <= $2
    `;

    const result = await neonClient.query(sql, [query.start_date, query.end_date]);
    const metrics = result.rows[0];

    // Get top pages
    const topPages = await this.getTopPages(query);
    const topSources = await this.getTopSources(query);
    const deviceBreakdown = await this.getDeviceBreakdown(query);
    const geoBreakdown = await this.getGeographicBreakdown(query);

    return {
      ...metrics,
      top_pages: topPages,
      top_sources: topSources,
      device_breakdown: deviceBreakdown,
      geographic_breakdown: geoBreakdown
    } as AnalyticsMetrics;
  }

  async getTopPages(query: AnalyticsQuery, limit: number = 10): Promise<PageMetrics[]> {
    const sql = `
      SELECT 
        page_url,
        page_title,
        COUNT(*) as views,
        COUNT(DISTINCT user_id) as unique_views,
        0 as bounce_rate,
        0 as average_time_on_page,
        COUNT(CASE WHEN event_type = 'conversion' THEN 1 END) as conversions,
        ROUND(
          COUNT(CASE WHEN event_type = 'conversion' THEN 1 END)::decimal / 
          NULLIF(COUNT(*), 0) * 100, 2
        ) as conversion_rate
      FROM analytics_events 
      WHERE created_at >= $1 AND created_at <= $2 
        AND event_type = 'page_view'
        AND page_url IS NOT NULL
      GROUP BY page_url, page_title
      ORDER BY views DESC
      LIMIT $3
    `;

    const result = await neonClient.query(sql, [query.start_date, query.end_date, limit]);
    return result.rows as PageMetrics[];
  }

  async getTopSources(query: AnalyticsQuery, limit: number = 10): Promise<SourceMetrics[]> {
    const sql = `
      SELECT 
        COALESCE(utm_source, 'direct') as source,
        COALESCE(utm_medium, 'none') as medium,
        utm_campaign as campaign,
        COUNT(DISTINCT session_id) as sessions,
        COUNT(DISTINCT user_id) as users,
        COUNT(CASE WHEN event_type = 'page_view' THEN 1 END) as page_views,
        0 as bounce_rate,
        COUNT(CASE WHEN event_type = 'conversion' THEN 1 END) as conversions,
        ROUND(
          COUNT(CASE WHEN event_type = 'conversion' THEN 1 END)::decimal / 
          NULLIF(COUNT(DISTINCT session_id), 0) * 100, 2
        ) as conversion_rate,
        0 as revenue
      FROM analytics_events 
      WHERE created_at >= $1 AND created_at <= $2
      GROUP BY utm_source, utm_medium, utm_campaign
      ORDER BY sessions DESC
      LIMIT $3
    `;

    const result = await neonClient.query(sql, [query.start_date, query.end_date, limit]);
    return result.rows as SourceMetrics[];
  }

  async getDeviceBreakdown(query: AnalyticsQuery): Promise<any[]> {
    const sql = `
      SELECT 
        COALESCE(device_type, 'unknown') as device_type,
        browser,
        os,
        COUNT(DISTINCT session_id) as sessions,
        COUNT(DISTINCT user_id) as users,
        0 as bounce_rate,
        ROUND(
          COUNT(CASE WHEN event_type = 'conversion' THEN 1 END)::decimal / 
          NULLIF(COUNT(DISTINCT session_id), 0) * 100, 2
        ) as conversion_rate
      FROM analytics_events 
      WHERE created_at >= $1 AND created_at <= $2
      GROUP BY device_type, browser, os
      ORDER BY sessions DESC
    `;

    const result = await neonClient.query(sql, [query.start_date, query.end_date]);
    return result.rows;
  }

  async getGeographicBreakdown(query: AnalyticsQuery): Promise<any[]> {
    const sql = `
      SELECT 
        COALESCE(country, 'unknown') as country,
        region,
        city,
        COUNT(DISTINCT session_id) as sessions,
        COUNT(DISTINCT user_id) as users,
        COUNT(CASE WHEN event_type = 'page_view' THEN 1 END) as page_views,
        ROUND(
          COUNT(CASE WHEN event_type = 'conversion' THEN 1 END)::decimal / 
          NULLIF(COUNT(DISTINCT session_id), 0) * 100, 2
        ) as conversion_rate,
        0 as revenue
      FROM analytics_events 
      WHERE created_at >= $1 AND created_at <= $2
      GROUP BY country, region, city
      ORDER BY sessions DESC
      LIMIT 50
    `;

    const result = await neonClient.query(sql, [query.start_date, query.end_date]);
    return result.rows;
  }

  // ============================
  // ATTRIBUTION TRACKING
  // ============================

  async createAttributionModel(data: CreateAttributionModelInput): Promise<AttributionModel> {
    const sql = `
      INSERT INTO attribution_models (
        user_id, sale_id, first_touch_campaign_id, first_touch_utm,
        last_touch_campaign_id, last_touch_utm, touchpoints,
        attribution_model, conversion_path, days_to_conversion
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const values = [
      data.user_id,
      data.sale_id,
      data.first_touch_campaign_id,
      JSON.stringify(data.first_touch_utm || {}),
      data.last_touch_campaign_id,
      JSON.stringify(data.last_touch_utm || {}),
      JSON.stringify(data.touchpoints || []),
      data.attribution_model,
      data.conversion_path,
      data.days_to_conversion
    ];

    const result = await neonClient.query(sql, values);
    return result.rows[0] as AttributionModel;
  }

  async getAttributionReport(
    startDate: Date, 
    endDate: Date, 
    model: AttributionModel['attribution_model'] = 'last_touch'
  ): Promise<AttributionReport> {
    const sql = `
      SELECT 
        attribution_model,
        COUNT(*) as total_conversions,
        COALESCE(SUM(s.net_amount), 0) as total_revenue
      FROM attribution_models am
      LEFT JOIN sales s ON am.sale_id = s.id
      WHERE am.created_at >= $1 AND am.created_at <= $2
        AND am.attribution_model = $3
      GROUP BY attribution_model
    `;

    const result = await neonClient.query(sql, [startDate, endDate, model]);
    const baseStats = result.rows[0] || { 
      attribution_model: model, 
      total_conversions: 0, 
      total_revenue: 0 
    };

    return {
      ...baseStats,
      channels: [],
      campaigns: [],
      touchpoint_analysis: []
    } as AttributionReport;
  }

  // ============================
  // REAL-TIME METRICS
  // ============================

  async getRealTimeMetrics(): Promise<RealTimeMetrics> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const sql = `
      SELECT 
        COUNT(DISTINCT user_id) as current_users,
        COUNT(CASE WHEN event_type = 'page_view' THEN 1 END) as page_views_last_hour,
        COUNT(CASE WHEN event_type = 'conversion' THEN 1 END) as current_conversions,
        0 as real_time_revenue
      FROM analytics_events 
      WHERE created_at >= $1
    `;

    const result = await neonClient.query(sql, [oneHourAgo]);
    const metrics = result.rows[0];

    // Get top active pages
    const topPagesQuery = `
      SELECT DISTINCT page_url 
      FROM analytics_events 
      WHERE created_at >= $1 AND event_type = 'page_view'
      ORDER BY created_at DESC 
      LIMIT 5
    `;
    const topPagesResult = await neonClient.query(topPagesQuery, [oneHourAgo]);

    return {
      ...metrics,
      top_active_pages: topPagesResult.rows.map(row => row.page_url),
      trending_campaigns: []
    } as RealTimeMetrics;
  }

  // ============================
  // USER JOURNEY ANALYSIS
  // ============================

  async getUserJourney(userId: string, limit: number = 100): Promise<AnalyticsEvent[]> {
    const sql = `
      SELECT * FROM analytics_events 
      WHERE user_id = $1 
      ORDER BY created_at ASC 
      LIMIT $2
    `;

    const result = await neonClient.query(sql, [userId, limit]);
    return result.rows as AnalyticsEvent[];
  }

  async getConversionFunnel(steps: string[]): Promise<ConversionFunnel> {
    // This would require more complex analysis
    return {
      steps: [],
      total_entries: 0,
      total_conversions: 0,
      overall_conversion_rate: 0,
      average_time_to_convert: 0
    } as ConversionFunnel;
  }

  // ============================
  // UTILITY METHODS
  // ============================

  async getUniqueVisitors(startDate: Date, endDate: Date): Promise<number> {
    const sql = `
      SELECT COUNT(DISTINCT user_id) as unique_visitors
      FROM analytics_events 
      WHERE created_at >= $1 AND created_at <= $2
        AND event_type = 'page_view'
    `;

    const result = await neonClient.query(sql, [startDate, endDate]);
    return result.rows[0]?.unique_visitors || 0;
  }

  async getPageViews(startDate: Date, endDate: Date): Promise<number> {
    const sql = `
      SELECT COUNT(*) as page_views
      FROM analytics_events 
      WHERE created_at >= $1 AND created_at <= $2
        AND event_type = 'page_view'
    `;

    const result = await neonClient.query(sql, [startDate, endDate]);
    return result.rows[0]?.page_views || 0;
  }

  async getConversions(startDate: Date, endDate: Date): Promise<number> {
    const sql = `
      SELECT COUNT(*) as conversions
      FROM analytics_events 
      WHERE created_at >= $1 AND created_at <= $2
        AND event_type = 'conversion'
    `;

    const result = await neonClient.query(sql, [startDate, endDate]);
    return result.rows[0]?.conversions || 0;
  }
} 