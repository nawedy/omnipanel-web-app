// omnipanel-core/packages/types/src/analytics.ts
// TypeScript types for analytics, attribution, and tracking

export interface AnalyticsEvent {
  id: string;
  user_id?: string;
  session_id?: string;
  event_type: string;
  event_name: string;
  page_url?: string;
  page_title?: string;
  referrer_url?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  properties: Record<string, any>;
  user_agent?: string;
  ip_address?: string;
  country?: string;
  region?: string;
  city?: string;
  device_type?: 'desktop' | 'mobile' | 'tablet';
  browser?: string;
  os?: string;
  created_at: Date;
}

export interface AttributionModel {
  id: string;
  user_id?: string;
  sale_id?: string;
  first_touch_campaign_id?: string;
  first_touch_utm: Record<string, any>;
  last_touch_campaign_id?: string;
  last_touch_utm: Record<string, any>;
  touchpoints: TouchPoint[];
  attribution_model: 'first_touch' | 'last_touch' | 'linear' | 'time_decay';
  conversion_path?: string;
  days_to_conversion?: number;
  touchpoint_count: number;
  created_at: Date;
}

export interface TouchPoint {
  timestamp: Date;
  event_type: string;
  campaign_id?: string;
  utm_data: Record<string, any>;
  channel: string;
  source: string;
  medium: string;
  value?: number;
  weight?: number;
}

export interface CreateAnalyticsEventInput {
  user_id?: string;
  session_id?: string;
  event_type: string;
  event_name: string;
  page_url?: string;
  page_title?: string;
  referrer_url?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  properties?: Record<string, any>;
  user_agent?: string;
  ip_address?: string;
  device_type?: AnalyticsEvent['device_type'];
  browser?: string;
  os?: string;
}

export interface CreateAttributionModelInput {
  user_id?: string;
  sale_id?: string;
  first_touch_campaign_id?: string;
  first_touch_utm?: Record<string, any>;
  last_touch_campaign_id?: string;
  last_touch_utm?: Record<string, any>;
  touchpoints: TouchPoint[];
  attribution_model: AttributionModel['attribution_model'];
  conversion_path?: string;
  days_to_conversion?: number;
}

export interface AnalyticsQuery {
  start_date: Date;
  end_date: Date;
  event_types?: string[];
  user_ids?: string[];
  campaign_ids?: string[];
  utm_sources?: string[];
  utm_mediums?: string[];
  device_types?: string[];
  countries?: string[];
  group_by?: string[];
  metrics?: string[];
}

export interface AnalyticsMetrics {
  total_events: number;
  unique_users: number;
  unique_sessions: number;
  page_views: number;
  bounce_rate: number;
  average_session_duration: number;
  conversion_rate: number;
  top_pages: PageMetrics[];
  top_sources: SourceMetrics[];
  device_breakdown: DeviceMetrics[];
  geographic_breakdown: GeographicMetrics[];
}

export interface PageMetrics {
  page_url: string;
  page_title?: string;
  views: number;
  unique_views: number;
  bounce_rate: number;
  average_time_on_page: number;
  conversions: number;
  conversion_rate: number;
}

export interface SourceMetrics {
  source: string;
  medium: string;
  campaign?: string;
  sessions: number;
  users: number;
  page_views: number;
  bounce_rate: number;
  conversions: number;
  conversion_rate: number;
  revenue: number;
}

export interface DeviceMetrics {
  device_type: string;
  browser?: string;
  os?: string;
  sessions: number;
  users: number;
  bounce_rate: number;
  conversion_rate: number;
}

export interface GeographicMetrics {
  country: string;
  region?: string;
  city?: string;
  sessions: number;
  users: number;
  page_views: number;
  conversion_rate: number;
  revenue: number;
}

export interface ConversionFunnel {
  steps: FunnelStep[];
  total_entries: number;
  total_conversions: number;
  overall_conversion_rate: number;
  average_time_to_convert: number;
}

export interface FunnelStep {
  step_name: string;
  step_order: number;
  event_type: string;
  users_entered: number;
  users_completed: number;
  conversion_rate: number;
  drop_off_rate: number;
  average_time_to_next_step?: number;
}

export interface CohortAnalysis {
  cohort_period: 'daily' | 'weekly' | 'monthly';
  cohorts: CohortData[];
  retention_rates: number[][];
}

export interface CohortData {
  cohort_date: Date;
  cohort_size: number;
  periods: CohortPeriod[];
}

export interface CohortPeriod {
  period: number;
  users_returned: number;
  retention_rate: number;
  revenue: number;
}

export interface AttributionReport {
  attribution_model: AttributionModel['attribution_model'];
  total_conversions: number;
  total_revenue: number;
  channels: ChannelAttribution[];
  campaigns: CampaignAttribution[];
  touchpoint_analysis: TouchPointAnalysis[];
}

export interface ChannelAttribution {
  channel: string;
  conversions: number;
  revenue: number;
  attribution_value: number;
  percentage_of_total: number;
}

export interface CampaignAttribution {
  campaign_id: string;
  campaign_name: string;
  conversions: number;
  revenue: number;
  attribution_value: number;
  cost?: number;
  roi?: number;
}

export interface TouchPointAnalysis {
  position: number;
  avg_touchpoints_at_position: number;
  conversion_rate: number;
  top_channels: string[];
  top_campaigns: string[];
}

export interface RealTimeMetrics {
  current_users: number;
  page_views_last_hour: number;
  top_active_pages: string[];
  current_conversions: number;
  real_time_revenue: number;
  trending_campaigns: string[];
}

export interface CustomEvent {
  event_name: string;
  properties: Record<string, any>;
  value?: number;
  currency?: string;
  user_id?: string;
  session_id?: string;
}

export interface EventProperties {
  [key: string]: string | number | boolean | Date | null;
} 