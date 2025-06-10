// omnipanel-core/packages/types/src/marketing.ts
// TypeScript types for marketing, campaigns, and lead management

export interface Campaign {
  id: string;
  name: string;
  slug: string;
  type: 'pre_sell' | 'launch' | 'retargeting' | 'affiliate';
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  description?: string;
  start_date?: Date;
  end_date?: Date;
  budget_total?: number;
  budget_spent: number;
  target_audience: Record<string, any>;
  campaign_settings: Record<string, any>;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface LandingPage {
  id: string;
  campaign_id?: string;
  name: string;
  slug: string;
  template_type?: 'pre_sell' | 'waitlist' | 'early_access' | 'coming_soon';
  content: Record<string, any>;
  seo_settings: Record<string, any>;
  conversion_settings: Record<string, any>;
  is_published: boolean;
  views_count: number;
  conversions_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface Lead {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  company?: string;
  job_title?: string;
  lead_source?: 'organic' | 'paid' | 'referral' | 'affiliate';
  lead_type?: 'pre_sell' | 'waitlist' | 'trial' | 'demo';
  campaign_id?: string;
  landing_page_id?: string;
  utm_data: Record<string, any>;
  custom_fields: Record<string, any>;
  lead_score: number;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  consent_marketing: boolean;
  consent_terms: boolean;
  ip_address?: string;
  user_agent?: string;
  referrer_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateCampaignInput {
  name: string;
  slug: string;
  type: Campaign['type'];
  description?: string;
  start_date?: Date;
  end_date?: Date;
  budget_total?: number;
  target_audience?: Record<string, any>;
  campaign_settings?: Record<string, any>;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

export interface CreateLandingPageInput {
  campaign_id?: string;
  name: string;
  slug: string;
  template_type?: LandingPage['template_type'];
  content?: Record<string, any>;
  seo_settings?: Record<string, any>;
  conversion_settings?: Record<string, any>;
}

export interface CreateLeadInput {
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  company?: string;
  job_title?: string;
  lead_source?: Lead['lead_source'];
  lead_type?: Lead['lead_type'];
  campaign_id?: string;
  landing_page_id?: string;
  utm_data?: Record<string, any>;
  custom_fields?: Record<string, any>;
  consent_marketing?: boolean;
  consent_terms?: boolean;
  ip_address?: string;
  user_agent?: string;
  referrer_url?: string;
}

export interface UpdateCampaignInput extends Partial<CreateCampaignInput> {
  status?: Campaign['status'];
  budget_spent?: number;
}

export interface UpdateLeadInput extends Partial<CreateLeadInput> {
  lead_score?: number;
  status?: Lead['status'];
}

export interface CampaignMetrics {
  campaign_id: string;
  total_leads: number;
  qualified_leads: number;
  converted_leads: number;
  conversion_rate: number;
  cost_per_lead: number;
  total_spent: number;
  roi: number;
}

export interface LeadAnalytics {
  lead_id: string;
  lead_score: number;
  engagement_score: number;
  last_activity?: Date;
  conversion_probability: number;
  touchpoints: number;
} 