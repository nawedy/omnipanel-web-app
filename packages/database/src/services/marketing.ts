// omnipanel-core/packages/database/src/services/marketing.ts
// Database services for marketing campaigns, landing pages, and leads

import { neonClient } from '../neon-client';
import type {
  Campaign,
  LandingPage,
  Lead,
  CreateCampaignInput,
  CreateLandingPageInput,
  CreateLeadInput,
  UpdateCampaignInput,
  UpdateLeadInput,
  CampaignMetrics,
  LeadAnalytics
} from '@omnipanel/types';

export class MarketingService {
  // ============================
  // CAMPAIGN OPERATIONS
  // ============================

  async createCampaign(data: CreateCampaignInput, userId?: string): Promise<Campaign> {
    const sql = `
      INSERT INTO campaigns (
        name, slug, type, description, start_date, end_date, 
        budget_total, target_audience, campaign_settings,
        utm_source, utm_medium, utm_campaign, utm_term, utm_content,
        created_by
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
      ) RETURNING *
    `;

    const values = [
      data.name,
      data.slug,
      data.type,
      data.description,
      data.start_date,
      data.end_date,
      data.budget_total,
      JSON.stringify(data.target_audience || {}),
      JSON.stringify(data.campaign_settings || {}),
      data.utm_source,
      data.utm_medium,
      data.utm_campaign,
      data.utm_term,
      data.utm_content,
      userId
    ];

    const result = await neonClient.query(sql, values);
    return result.rows[0] as Campaign;
  }

  async updateCampaign(id: string, data: UpdateCampaignInput): Promise<Campaign> {
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    // Build dynamic update query
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'target_audience' || key === 'campaign_settings') {
          updateFields.push(`${key} = $${paramCount}`);
          values.push(JSON.stringify(value));
        } else {
          updateFields.push(`${key} = $${paramCount}`);
          values.push(value);
        }
        paramCount++;
      }
    });

    updateFields.push('updated_at = NOW()');
    values.push(id);

    const sql = `
      UPDATE campaigns 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await neonClient.query(sql, values);
    return result.rows[0] as Campaign;
  }

  async getCampaign(id: string): Promise<Campaign | null> {
    const sql = 'SELECT * FROM campaigns WHERE id = $1';
    const result = await neonClient.query(sql, [id]);
    return result.rows[0] as Campaign || null;
  }

  async getCampaignBySlug(slug: string): Promise<Campaign | null> {
    const sql = 'SELECT * FROM campaigns WHERE slug = $1';
    const result = await neonClient.query(sql, [slug]);
    return result.rows[0] as Campaign || null;
  }

  async listCampaigns(params: {
    status?: string;
    type?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<Campaign[]> {
    let sql = 'SELECT * FROM campaigns WHERE 1=1';
    const values: any[] = [];
    let paramCount = 1;

    if (params.status) {
      sql += ` AND status = $${paramCount}`;
      values.push(params.status);
      paramCount++;
    }

    if (params.type) {
      sql += ` AND type = $${paramCount}`;
      values.push(params.type);
      paramCount++;
    }

    sql += ' ORDER BY created_at DESC';

    if (params.limit) {
      sql += ` LIMIT $${paramCount}`;
      values.push(params.limit);
      paramCount++;
    }

    if (params.offset) {
      sql += ` OFFSET $${paramCount}`;
      values.push(params.offset);
    }

    const result = await neonClient.query(sql, values);
    return result.rows as Campaign[];
  }

  async deleteCampaign(id: string): Promise<boolean> {
    const sql = 'DELETE FROM campaigns WHERE id = $1';
    const result = await neonClient.query(sql, [id]);
    return result.rowCount > 0;
  }

  // ============================
  // LANDING PAGE OPERATIONS
  // ============================

  async createLandingPage(data: CreateLandingPageInput): Promise<LandingPage> {
    const sql = `
      INSERT INTO landing_pages (
        campaign_id, name, slug, template_type, content,
        seo_settings, conversion_settings
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      data.campaign_id,
      data.name,
      data.slug,
      data.template_type,
      JSON.stringify(data.content || {}),
      JSON.stringify(data.seo_settings || {}),
      JSON.stringify(data.conversion_settings || {})
    ];

    const result = await neonClient.query(sql, values);
    return result.rows[0] as LandingPage;
  }

  async getLandingPage(id: string): Promise<LandingPage | null> {
    const sql = 'SELECT * FROM landing_pages WHERE id = $1';
    const result = await neonClient.query(sql, [id]);
    return result.rows[0] as LandingPage || null;
  }

  async getLandingPageBySlug(slug: string): Promise<LandingPage | null> {
    const sql = 'SELECT * FROM landing_pages WHERE slug = $1';
    const result = await neonClient.query(sql, [slug]);
    return result.rows[0] as LandingPage || null;
  }

  async incrementLandingPageViews(id: string): Promise<void> {
    const sql = 'UPDATE landing_pages SET views_count = views_count + 1 WHERE id = $1';
    await neonClient.query(sql, [id]);
  }

  async incrementLandingPageConversions(id: string): Promise<void> {
    const sql = 'UPDATE landing_pages SET conversions_count = conversions_count + 1 WHERE id = $1';
    await neonClient.query(sql, [id]);
  }

  // ============================
  // LEAD OPERATIONS
  // ============================

  async createLead(data: CreateLeadInput): Promise<Lead> {
    const sql = `
      INSERT INTO leads (
        email, first_name, last_name, phone, company, job_title,
        lead_source, lead_type, campaign_id, landing_page_id,
        utm_data, custom_fields, consent_marketing, consent_terms,
        ip_address, user_agent, referrer_url
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
      ) RETURNING *
    `;

    const values = [
      data.email,
      data.first_name,
      data.last_name,
      data.phone,
      data.company,
      data.job_title,
      data.lead_source,
      data.lead_type,
      data.campaign_id,
      data.landing_page_id,
      JSON.stringify(data.utm_data || {}),
      JSON.stringify(data.custom_fields || {}),
      data.consent_marketing || false,
      data.consent_terms || false,
      data.ip_address,
      data.user_agent,
      data.referrer_url
    ];

    const result = await neonClient.query(sql, values);
    
    // Increment landing page conversions if applicable
    if (data.landing_page_id) {
      await this.incrementLandingPageConversions(data.landing_page_id);
    }

    return result.rows[0] as Lead;
  }

  async updateLead(id: string, data: UpdateLeadInput): Promise<Lead> {
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'utm_data' || key === 'custom_fields') {
          updateFields.push(`${key} = $${paramCount}`);
          values.push(JSON.stringify(value));
        } else {
          updateFields.push(`${key} = $${paramCount}`);
          values.push(value);
        }
        paramCount++;
      }
    });

    updateFields.push('updated_at = NOW()');
    values.push(id);

    const sql = `
      UPDATE leads 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await neonClient.query(sql, values);
    return result.rows[0] as Lead;
  }

  async getLead(id: string): Promise<Lead | null> {
    const sql = 'SELECT * FROM leads WHERE id = $1';
    const result = await neonClient.query(sql, [id]);
    return result.rows[0] as Lead || null;
  }

  async getLeadByEmail(email: string): Promise<Lead | null> {
    const sql = 'SELECT * FROM leads WHERE email = $1 ORDER BY created_at DESC LIMIT 1';
    const result = await neonClient.query(sql, [email]);
    return result.rows[0] as Lead || null;
  }

  async listLeads(params: {
    campaign_id?: string;
    status?: string;
    lead_source?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<Lead[]> {
    let sql = 'SELECT * FROM leads WHERE 1=1';
    const values: any[] = [];
    let paramCount = 1;

    if (params.campaign_id) {
      sql += ` AND campaign_id = $${paramCount}`;
      values.push(params.campaign_id);
      paramCount++;
    }

    if (params.status) {
      sql += ` AND status = $${paramCount}`;
      values.push(params.status);
      paramCount++;
    }

    if (params.lead_source) {
      sql += ` AND lead_source = $${paramCount}`;
      values.push(params.lead_source);
      paramCount++;
    }

    sql += ' ORDER BY created_at DESC';

    if (params.limit) {
      sql += ` LIMIT $${paramCount}`;
      values.push(params.limit);
      paramCount++;
    }

    if (params.offset) {
      sql += ` OFFSET $${paramCount}`;
      values.push(params.offset);
    }

    const result = await neonClient.query(sql, values);
    return result.rows as Lead[];
  }

  // ============================
  // ANALYTICS & METRICS
  // ============================

  async getCampaignMetrics(campaignId: string): Promise<CampaignMetrics> {
    const sql = `
      SELECT 
        c.id as campaign_id,
        COUNT(l.id) as total_leads,
        COUNT(CASE WHEN l.status = 'qualified' THEN 1 END) as qualified_leads,
        COUNT(CASE WHEN l.status = 'converted' THEN 1 END) as converted_leads,
        CASE 
          WHEN COUNT(l.id) > 0 THEN 
            ROUND((COUNT(CASE WHEN l.status = 'converted' THEN 1 END)::decimal / COUNT(l.id)::decimal) * 100, 2)
          ELSE 0 
        END as conversion_rate,
        CASE 
          WHEN COUNT(l.id) > 0 AND c.budget_spent > 0 THEN 
            ROUND(c.budget_spent / COUNT(l.id), 2)
          ELSE 0 
        END as cost_per_lead,
        c.budget_spent as total_spent,
        CASE 
          WHEN c.budget_spent > 0 THEN 
            ROUND(((COALESCE(SUM(s.net_amount), 0) - c.budget_spent) / c.budget_spent) * 100, 2)
          ELSE 0 
        END as roi
      FROM campaigns c
      LEFT JOIN leads l ON c.id = l.campaign_id
      LEFT JOIN sales s ON l.id = s.lead_id
      WHERE c.id = $1
      GROUP BY c.id, c.budget_spent
    `;

    const result = await neonClient.query(sql, [campaignId]);
    return result.rows[0] as CampaignMetrics;
  }

  async getLeadAnalytics(leadId: string): Promise<LeadAnalytics> {
    const sql = `
      SELECT 
        l.id as lead_id,
        l.lead_score,
        COALESCE(
          (
            SELECT COUNT(*) 
            FROM analytics_events ae 
            WHERE ae.user_id::text = l.email
          ), 0
        ) as engagement_score,
        (
          SELECT MAX(ae.created_at) 
          FROM analytics_events ae 
          WHERE ae.user_id::text = l.email
        ) as last_activity,
        CASE 
          WHEN l.lead_score >= 80 THEN 0.9
          WHEN l.lead_score >= 60 THEN 0.7
          WHEN l.lead_score >= 40 THEN 0.5
          WHEN l.lead_score >= 20 THEN 0.3
          ELSE 0.1
        END as conversion_probability,
        COALESCE(
          (
            SELECT COUNT(*) 
            FROM analytics_events ae 
            WHERE ae.user_id::text = l.email
          ), 0
        ) as touchpoints
      FROM leads l
      WHERE l.id = $1
    `;

    const result = await neonClient.query(sql, [leadId]);
    return result.rows[0] as LeadAnalytics;
  }

  async searchLeads(query: string, limit: number = 50): Promise<Lead[]> {
    const sql = `
      SELECT * FROM leads 
      WHERE 
        email ILIKE $1 OR 
        first_name ILIKE $1 OR 
        last_name ILIKE $1 OR 
        company ILIKE $1
      ORDER BY created_at DESC
      LIMIT $2
    `;

    const searchTerm = `%${query}%`;
    const result = await neonClient.query(sql, [searchTerm, limit]);
    return result.rows as Lead[];
  }
} 