// omnipanel-core/packages/database/src/services/sales.ts
// Database services for sales, products, subscriptions, and affiliate management

import { neonClient } from '../neon-client';
import type {
  Product,
  PricingTier,
  Subscription,
  Sale,
  Affiliate,
  AffiliateReferral,
  CreateProductInput,
  CreatePricingTierInput,
  CreateSubscriptionInput,
  CreateSaleInput,
  CreateAffiliateInput,
  UpdateProductInput,
  UpdateSubscriptionInput,
  UpdateAffiliateInput,
  SalesMetrics,
  ProductMetrics,
  AffiliateMetrics
} from '@omnipanel/types';

export class SalesService {
  // ============================
  // PRODUCT OPERATIONS
  // ============================

  async createProduct(data: CreateProductInput): Promise<Product> {
    const sql = `
      INSERT INTO products (
        name, slug, description, product_type, pricing_model,
        base_price, currency, billing_interval, trial_days,
        features, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const values = [
      data.name,
      data.slug,
      data.description,
      data.product_type,
      data.pricing_model,
      data.base_price,
      data.currency || 'USD',
      data.billing_interval,
      data.trial_days || 0,
      JSON.stringify(data.features || []),
      JSON.stringify(data.metadata || {})
    ];

    const result = await neonClient.query(sql, values);
    return result.rows[0] as Product;
  }

  async updateProduct(id: string, data: UpdateProductInput): Promise<Product> {
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'features' || key === 'metadata') {
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
      UPDATE products 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await neonClient.query(sql, values);
    return result.rows[0] as Product;
  }

  async getProduct(id: string): Promise<Product | null> {
    const sql = 'SELECT * FROM products WHERE id = $1';
    const result = await neonClient.query(sql, [id]);
    return result.rows[0] as Product || null;
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    const sql = 'SELECT * FROM products WHERE slug = $1 AND is_active = true';
    const result = await neonClient.query(sql, [slug]);
    return result.rows[0] as Product || null;
  }

  async listProducts(activeOnly: boolean = true): Promise<Product[]> {
    let sql = 'SELECT * FROM products';
    if (activeOnly) {
      sql += ' WHERE is_active = true';
    }
    sql += ' ORDER BY created_at DESC';

    const result = await neonClient.query(sql);
    return result.rows as Product[];
  }

  // ============================
  // PRICING TIER OPERATIONS
  // ============================

  async createPricingTier(data: CreatePricingTierInput): Promise<PricingTier> {
    const sql = `
      INSERT INTO pricing_tiers (
        product_id, name, slug, price, billing_interval,
        features, limits, is_popular, sort_order
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      data.product_id,
      data.name,
      data.slug,
      data.price,
      data.billing_interval,
      JSON.stringify(data.features || []),
      JSON.stringify(data.limits || {}),
      data.is_popular || false,
      data.sort_order || 0
    ];

    const result = await neonClient.query(sql, values);
    return result.rows[0] as PricingTier;
  }

  async getPricingTier(id: string): Promise<PricingTier | null> {
    const sql = 'SELECT * FROM pricing_tiers WHERE id = $1';
    const result = await neonClient.query(sql, [id]);
    return result.rows[0] as PricingTier || null;
  }

  async listPricingTiers(productId: string, activeOnly: boolean = true): Promise<PricingTier[]> {
    let sql = 'SELECT * FROM pricing_tiers WHERE product_id = $1';
    if (activeOnly) {
      sql += ' AND is_active = true';
    }
    sql += ' ORDER BY sort_order ASC, price ASC';

    const result = await neonClient.query(sql, [productId]);
    return result.rows as PricingTier[];
  }

  // ============================
  // SUBSCRIPTION OPERATIONS
  // ============================

  async createSubscription(data: CreateSubscriptionInput): Promise<Subscription> {
    const sql = `
      INSERT INTO subscriptions (
        user_id, product_id, pricing_tier_id, stripe_subscription_id,
        status, trial_start, trial_end, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      data.user_id,
      data.product_id,
      data.pricing_tier_id,
      data.stripe_subscription_id,
      'trialing', // Default status
      data.trial_start,
      data.trial_end,
      JSON.stringify(data.metadata || {})
    ];

    const result = await neonClient.query(sql, values);
    return result.rows[0] as Subscription;
  }

  async updateSubscription(id: string, data: UpdateSubscriptionInput): Promise<Subscription> {
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'metadata') {
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
      UPDATE subscriptions 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await neonClient.query(sql, values);
    return result.rows[0] as Subscription;
  }

  async getSubscription(id: string): Promise<Subscription | null> {
    const sql = 'SELECT * FROM subscriptions WHERE id = $1';
    const result = await neonClient.query(sql, [id]);
    return result.rows[0] as Subscription || null;
  }

  async getUserSubscriptions(userId: string): Promise<Subscription[]> {
    const sql = `
      SELECT s.*, p.name as product_name, pt.name as tier_name
      FROM subscriptions s
      JOIN products p ON s.product_id = p.id
      JOIN pricing_tiers pt ON s.pricing_tier_id = pt.id
      WHERE s.user_id = $1
      ORDER BY s.created_at DESC
    `;

    const result = await neonClient.query(sql, [userId]);
    return result.rows as Subscription[];
  }

  async getActiveSubscription(userId: string, productId?: string): Promise<Subscription | null> {
    let sql = `
      SELECT * FROM subscriptions 
      WHERE user_id = $1 AND status IN ('active', 'trialing')
    `;
    const values = [userId];

    if (productId) {
      sql += ' AND product_id = $2';
      values.push(productId);
    }

    sql += ' ORDER BY created_at DESC LIMIT 1';

    const result = await neonClient.query(sql, values);
    return result.rows[0] as Subscription || null;
  }

  // ============================
  // SALES OPERATIONS
  // ============================

  async createSale(data: CreateSaleInput): Promise<Sale> {
    const sql = `
      INSERT INTO sales (
        user_id, lead_id, subscription_id, product_id, pricing_tier_id,
        affiliate_id, campaign_id, amount, currency, commission_amount,
        tax_amount, discount_amount, net_amount, payment_method,
        payment_status, transaction_type, utm_data, metadata,
        stripe_payment_intent_id, stripe_charge_id
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
      ) RETURNING *
    `;

    const netAmount = data.amount - (data.tax_amount || 0) - (data.discount_amount || 0);

    const values = [
      data.user_id,
      data.lead_id,
      data.subscription_id,
      data.product_id,
      data.pricing_tier_id,
      data.affiliate_id,
      data.campaign_id,
      data.amount,
      data.currency || 'USD',
      data.commission_amount || 0,
      data.tax_amount || 0,
      data.discount_amount || 0,
      netAmount,
      data.payment_method,
      'pending',
      data.transaction_type,
      JSON.stringify(data.utm_data || {}),
      JSON.stringify(data.metadata || {}),
      data.stripe_payment_intent_id,
      data.stripe_charge_id
    ];

    const result = await neonClient.query(sql, values);
    return result.rows[0] as Sale;
  }

  async updateSaleStatus(id: string, status: Sale['payment_status']): Promise<Sale> {
    const sql = `
      UPDATE sales 
      SET payment_status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;

    const result = await neonClient.query(sql, [status, id]);
    return result.rows[0] as Sale;
  }

  async getSale(id: string): Promise<Sale | null> {
    const sql = 'SELECT * FROM sales WHERE id = $1';
    const result = await neonClient.query(sql, [id]);
    return result.rows[0] as Sale || null;
  }

  async getUserSales(userId: string): Promise<Sale[]> {
    const sql = `
      SELECT s.*, p.name as product_name
      FROM sales s
      JOIN products p ON s.product_id = p.id
      WHERE s.user_id = $1
      ORDER BY s.created_at DESC
    `;

    const result = await neonClient.query(sql, [userId]);
    return result.rows as Sale[];
  }

  // ============================
  // AFFILIATE OPERATIONS
  // ============================

  async createAffiliate(data: CreateAffiliateInput): Promise<Affiliate> {
    const sql = `
      INSERT INTO affiliates (
        user_id, affiliate_code, company_name, contact_email,
        contact_name, website_url, commission_rate, commission_type,
        payment_terms
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      data.user_id,
      data.affiliate_code,
      data.company_name,
      data.contact_email,
      data.contact_name,
      data.website_url,
      data.commission_rate || 0.10,
      data.commission_type || 'percentage',
      data.payment_terms || 'monthly'
    ];

    const result = await neonClient.query(sql, values);
    return result.rows[0] as Affiliate;
  }

  async updateAffiliate(id: string, data: UpdateAffiliateInput): Promise<Affiliate> {
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'metadata') {
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
      UPDATE affiliates 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await neonClient.query(sql, values);
    return result.rows[0] as Affiliate;
  }

  async getAffiliate(id: string): Promise<Affiliate | null> {
    const sql = 'SELECT * FROM affiliates WHERE id = $1';
    const result = await neonClient.query(sql, [id]);
    return result.rows[0] as Affiliate || null;
  }

  async getAffiliateByCode(code: string): Promise<Affiliate | null> {
    const sql = 'SELECT * FROM affiliates WHERE affiliate_code = $1 AND status = \'active\'';
    const result = await neonClient.query(sql, [code]);
    return result.rows[0] as Affiliate || null;
  }

  async createAffiliateReferral(affiliateId: string, data: {
    lead_id?: string;
    user_id?: string;
    referral_code?: string;
    ip_address?: string;
    user_agent?: string;
    referrer_url?: string;
    landing_url?: string;
    utm_data?: Record<string, any>;
  }): Promise<AffiliateReferral> {
    const sql = `
      INSERT INTO affiliate_referrals (
        affiliate_id, lead_id, user_id, referral_code,
        ip_address, user_agent, referrer_url, landing_url, utm_data
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      affiliateId,
      data.lead_id,
      data.user_id,
      data.referral_code,
      data.ip_address,
      data.user_agent,
      data.referrer_url,
      data.landing_url,
      JSON.stringify(data.utm_data || {})
    ];

    const result = await neonClient.query(sql, values);
    return result.rows[0] as AffiliateReferral;
  }

  // ============================
  // ANALYTICS & METRICS
  // ============================

  async getSalesMetrics(dateRange?: { start: Date; end: Date }): Promise<SalesMetrics> {
    let dateFilter = '';
    const values: any[] = [];

    if (dateRange) {
      dateFilter = 'WHERE created_at >= $1 AND created_at <= $2';
      values.push(dateRange.start, dateRange.end);
    }

    const sql = `
      SELECT 
        COALESCE(SUM(net_amount), 0) as total_revenue,
        COUNT(*) as total_sales,
        CASE 
          WHEN COUNT(*) > 0 THEN ROUND(AVG(net_amount), 2)
          ELSE 0 
        END as average_order_value,
        0 as conversion_rate,
        0 as monthly_recurring_revenue,
        0 as annual_recurring_revenue,
        0 as churn_rate,
        0 as customer_lifetime_value
      FROM sales 
      WHERE payment_status = 'succeeded'
      ${dateFilter}
    `;

    const result = await neonClient.query(sql, values);
    return result.rows[0] as SalesMetrics;
  }

  async getProductMetrics(productId: string): Promise<ProductMetrics> {
    const sql = `
      SELECT 
        $1 as product_id,
        COUNT(*) as total_sales,
        COALESCE(SUM(net_amount), 0) as total_revenue,
        (
          SELECT COUNT(*) 
          FROM subscriptions 
          WHERE product_id = $1 AND status IN ('active', 'trialing')
        ) as active_subscriptions,
        0 as conversion_rate,
        CASE 
          WHEN COUNT(DISTINCT user_id) > 0 THEN 
            ROUND(SUM(net_amount) / COUNT(DISTINCT user_id), 2)
          ELSE 0 
        END as average_revenue_per_user
      FROM sales 
      WHERE product_id = $1 AND payment_status = 'succeeded'
    `;

    const result = await neonClient.query(sql, [productId]);
    return result.rows[0] as ProductMetrics;
  }

  async getAffiliateMetrics(affiliateId: string): Promise<AffiliateMetrics> {
    const sql = `
      SELECT 
        $1 as affiliate_id,
        COUNT(ar.*) as total_clicks,
        COUNT(CASE WHEN ar.status = 'converted' THEN 1 END) as total_conversions,
        CASE 
          WHEN COUNT(ar.*) > 0 THEN 
            ROUND((COUNT(CASE WHEN ar.status = 'converted' THEN 1 END)::decimal / COUNT(ar.*)::decimal) * 100, 2)
          ELSE 0 
        END as conversion_rate,
        COALESCE(SUM(s.commission_amount), 0) as total_commission_earned,
        COALESCE(SUM(CASE WHEN ar.status = 'credited' THEN s.commission_amount ELSE 0 END), 0) as commission_pending,
        COALESCE(SUM(CASE WHEN ar.status = 'paid' THEN s.commission_amount ELSE 0 END), 0) as commission_paid
      FROM affiliate_referrals ar
      LEFT JOIN sales s ON (ar.user_id = s.user_id OR ar.lead_id = s.lead_id)
      WHERE ar.affiliate_id = $1
    `;

    const result = await neonClient.query(sql, [affiliateId]);
    return result.rows[0] as AffiliateMetrics;
  }

  async getTopProducts(limit: number = 10): Promise<Product[]> {
    const sql = `
      SELECT p.*, COUNT(s.id) as sale_count, SUM(s.net_amount) as total_revenue
      FROM products p
      LEFT JOIN sales s ON p.id = s.product_id AND s.payment_status = 'succeeded'
      WHERE p.is_active = true
      GROUP BY p.id
      ORDER BY total_revenue DESC NULLS LAST, sale_count DESC
      LIMIT $1
    `;

    const result = await neonClient.query(sql, [limit]);
    return result.rows as Product[];
  }

  async getRevenueByMonth(months: number = 12): Promise<Array<{ month: string; revenue: number; sales: number }>> {
    const sql = `
      SELECT 
        TO_CHAR(created_at, 'YYYY-MM') as month,
        SUM(net_amount) as revenue,
        COUNT(*) as sales
      FROM sales 
      WHERE payment_status = 'succeeded' 
        AND created_at >= NOW() - INTERVAL '${months} months'
      GROUP BY TO_CHAR(created_at, 'YYYY-MM')
      ORDER BY month DESC
    `;

    const result = await neonClient.query(sql);
    return result.rows as Array<{ month: string; revenue: number; sales: number }>;
  }
} 