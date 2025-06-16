// packages/database/src/services/marketing.ts
// Marketing database service operations

import { getNeonClient, extractFirstRow, extractRows } from '../client';
import type { DatabaseConfig } from '@omnipanel/config';

// Basic marketing interfaces
export interface Campaign {
  id: string;
  name: string;
  description?: string;
  status: string;
  start_date: string;
  end_date?: string;
  budget: number;
  spent: number;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  source: string;
  status: string;
  score: number;
  properties: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface LandingPage {
  id: string;
  name: string;
  slug: string;
  title: string;
  content: string;
  status: string;
  conversion_rate: number;
  views: number;
  conversions: number;
  created_at: string;
  updated_at: string;
}

export class MarketingService {
  private client: ReturnType<typeof getNeonClient>;

  constructor(config?: DatabaseConfig) {
    this.client = getNeonClient(config);
  }

  // Campaign operations
  async createCampaign(campaignData: Omit<Campaign, 'id' | 'created_at' | 'updated_at'>): Promise<Campaign> {
    const result = await this.client(
      `INSERT INTO campaigns (name, description, status, start_date, end_date, budget, spent)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        campaignData.name,
        campaignData.description,
        campaignData.status,
        campaignData.start_date,
        campaignData.end_date,
        campaignData.budget,
        campaignData.spent
      ]
    );
    return extractFirstRow(result) as unknown as unknown as Campaign;
  }

  async getCampaignById(id: string): Promise<Campaign | null> {
    const result = await this.client('SELECT * FROM campaigns WHERE id = $1', [id]);
    return extractFirstRow(result) as unknown as unknown as Campaign | null;
  }

  async getCampaignBySlug(slug: string): Promise<Campaign | null> {
    const result = await this.client('SELECT * FROM campaigns WHERE slug = $1', [slug]);
    return extractFirstRow(result) as unknown as unknown as Campaign | null;
  }

  async getAllCampaigns(): Promise<Campaign[]> {
    const result = await this.client('SELECT * FROM campaigns ORDER BY created_at DESC');
    return extractRows(result) as unknown as unknown as Campaign[];
  }

  async updateCampaign(id: string, updates: Partial<Omit<Campaign, 'id' | 'created_at' | 'updated_at'>>): Promise<Campaign> {
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    
    const values = [id, ...Object.values(updates)];
    
    const result = await this.client(
      `UPDATE campaigns SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      values
    );
    return extractFirstRow(result) as unknown as unknown as Campaign;
  }

  async deleteCampaign(id: string): Promise<void> {
    await this.client('DELETE FROM campaigns WHERE id = $1', [id]);
  }

  // Landing page operations
  async createLandingPage(pageData: Omit<LandingPage, 'id' | 'created_at' | 'updated_at'>): Promise<LandingPage> {
    const result = await this.client(
      `INSERT INTO landing_pages (name, slug, title, content, status, conversion_rate, views, conversions)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        pageData.name,
        pageData.slug,
        pageData.title,
        pageData.content,
        pageData.status,
        pageData.conversion_rate,
        pageData.views,
        pageData.conversions
      ]
    );
    return extractFirstRow(result) as unknown as unknown as LandingPage;
  }

  async getLandingPageById(id: string): Promise<LandingPage | null> {
    const result = await this.client('SELECT * FROM landing_pages WHERE id = $1', [id]);
    return extractFirstRow(result) as unknown as unknown as LandingPage | null;
  }

  async getLandingPageBySlug(slug: string): Promise<LandingPage | null> {
    const result = await this.client('SELECT * FROM landing_pages WHERE slug = $1', [slug]);
    return extractFirstRow(result) as unknown as unknown as LandingPage | null;
  }

  async updateLandingPage(id: string, updates: Partial<Omit<LandingPage, 'id' | 'created_at' | 'updated_at'>>): Promise<LandingPage> {
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    
    const values = [id, ...Object.values(updates)];
    
    const result = await this.client(
      `UPDATE landing_pages SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      values
    );
    return extractFirstRow(result) as unknown as unknown as LandingPage;
  }

  async deleteLandingPage(id: string): Promise<void> {
    await this.client('DELETE FROM landing_pages WHERE id = $1', [id]);
  }

  // Lead operations
  async createLead(leadData: Omit<Lead, 'id' | 'created_at' | 'updated_at'>): Promise<Lead> {
    const result = await this.client(
      `INSERT INTO leads (email, name, phone, source, status, score, properties)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        leadData.email,
        leadData.name,
        leadData.phone,
        leadData.source,
        leadData.status,
        leadData.score,
        JSON.stringify(leadData.properties)
      ]
    );
    return extractFirstRow(result) as unknown as unknown as Lead;
  }

  async getLeadById(id: string): Promise<Lead | null> {
    const result = await this.client('SELECT * FROM leads WHERE id = $1', [id]);
    return extractFirstRow(result) as unknown as unknown as Lead | null;
  }

  async getLeadByEmail(email: string): Promise<Lead | null> {
    const result = await this.client('SELECT * FROM leads WHERE email = $1', [email]);
    return extractFirstRow(result) as unknown as unknown as Lead | null;
  }

  async updateLead(id: string, updates: Partial<Omit<Lead, 'id' | 'created_at' | 'updated_at'>>): Promise<Lead> {
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    
    const values = [id, ...Object.values(updates)];
    
    const result = await this.client(
      `UPDATE leads SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      values
    );
    return extractFirstRow(result) as unknown as unknown as Lead;
  }

  // Analytics and reporting
  async getCampaignMetrics(campaignId: string): Promise<{
    impressions: number;
    clicks: number;
    conversions: number;
    cost: number;
    revenue: number;
  }> {
    const result = await this.client(
      `SELECT 
         COALESCE(SUM(impressions), 0) as impressions,
         COALESCE(SUM(clicks), 0) as clicks,
         COALESCE(SUM(conversions), 0) as conversions,
         COALESCE(SUM(cost), 0) as cost,
         COALESCE(SUM(revenue), 0) as revenue
       FROM campaign_metrics 
       WHERE campaign_id = $1`,
      [campaignId]
    );
    
    const row = extractFirstRow(result) as Record<string, unknown>;
    return {
      impressions: parseInt((row?.impressions as string) || '0'),
      clicks: parseInt((row?.clicks as string) || '0'),
      conversions: parseInt((row?.conversions as string) || '0'),
      cost: parseFloat((row?.cost as string) || '0'),
      revenue: parseFloat((row?.revenue as string) || '0')
    };
  }

  async getLeadAnalytics(leadId: string): Promise<{
    score: number;
    interactions: number;
    last_activity: string;
    conversion_probability: number;
  }> {
    const result = await this.client(
      `SELECT 
         score,
         COALESCE(interaction_count, 0) as interactions,
         COALESCE(last_activity, created_at) as last_activity,
         COALESCE(conversion_probability, 0) as conversion_probability
       FROM leads 
       WHERE id = $1`,
      [leadId]
    );
    
    const row = extractFirstRow(result) as Record<string, unknown>;
    return {
      score: parseInt((row?.score as string) || '0'),
      interactions: parseInt((row?.interactions as string) || '0'),
      last_activity: (row?.last_activity as string) || '',
      conversion_probability: parseFloat((row?.conversion_probability as string) || '0')
    };
  }

  async searchLeads(searchTerm: string, limit = 50): Promise<Lead[]> {
    const result = await this.client(
      `SELECT * FROM leads 
       WHERE email ILIKE $1 OR name ILIKE $1 OR phone ILIKE $1
       ORDER BY score DESC, created_at DESC
       LIMIT $2`,
      [`%${searchTerm}%`, limit]
    );
    return extractRows(result) as unknown as unknown as Lead[];
  }
} 