// omnipanel-core/packages/types/src/sales.ts
// TypeScript types for sales, products, and subscription management

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  product_type: 'saas' | 'course' | 'ebook' | 'consulting' | 'lifetime';
  pricing_model: 'one_time' | 'subscription' | 'tiered' | 'usage_based';
  base_price?: number;
  currency: string;
  billing_interval?: 'monthly' | 'quarterly' | 'yearly' | 'one_time';
  trial_days: number;
  features: string[];
  metadata: Record<string, any>;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface PricingTier {
  id: string;
  product_id: string;
  name: string;
  slug: string;
  price: number;
  billing_interval?: 'monthly' | 'yearly' | 'one_time';
  features: string[];
  limits: Record<string, any>;
  is_popular: boolean;
  sort_order: number;
  is_active: boolean;
  created_at: Date;
}

export interface Subscription {
  id: string;
  user_id: string;
  product_id: string;
  pricing_tier_id: string;
  stripe_subscription_id?: string;
  status: 'active' | 'past_due' | 'canceled' | 'unpaid' | 'trialing';
  current_period_start?: Date;
  current_period_end?: Date;
  trial_start?: Date;
  trial_end?: Date;
  cancel_at_period_end: boolean;
  canceled_at?: Date;
  ended_at?: Date;
  metadata: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface Sale {
  id: string;
  user_id?: string;
  lead_id?: string;
  subscription_id?: string;
  product_id: string;
  pricing_tier_id?: string;
  affiliate_id?: string;
  campaign_id?: string;
  stripe_payment_intent_id?: string;
  stripe_charge_id?: string;
  amount: number;
  currency: string;
  commission_amount: number;
  tax_amount: number;
  discount_amount: number;
  net_amount: number;
  payment_method?: string;
  payment_status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  transaction_type: 'initial' | 'renewal' | 'upgrade' | 'downgrade';
  utm_data: Record<string, any>;
  metadata: Record<string, any>;
  refunded_at?: Date;
  created_at: Date;
}

export interface Affiliate {
  id: string;
  user_id?: string;
  affiliate_code: string;
  company_name?: string;
  contact_email: string;
  contact_name?: string;
  website_url?: string;
  commission_rate: number;
  commission_type: 'percentage' | 'fixed';
  payment_terms: string;
  status: 'pending' | 'active' | 'suspended' | 'terminated';
  total_referrals: number;
  total_sales: number;
  total_commission: number;
  metadata: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface AffiliateReferral {
  id: string;
  affiliate_id: string;
  lead_id?: string;
  user_id?: string;
  referral_code?: string;
  click_id: string;
  ip_address?: string;
  user_agent?: string;
  referrer_url?: string;
  landing_url?: string;
  utm_data: Record<string, any>;
  conversion_data: Record<string, any>;
  status: 'pending' | 'converted' | 'credited' | 'paid';
  converted_at?: Date;
  credited_at?: Date;
  created_at: Date;
}

export interface CreateProductInput {
  name: string;
  slug: string;
  description?: string;
  product_type: Product['product_type'];
  pricing_model: Product['pricing_model'];
  base_price?: number;
  currency?: string;
  billing_interval?: Product['billing_interval'];
  trial_days?: number;
  features?: string[];
  metadata?: Record<string, any>;
}

export interface CreatePricingTierInput {
  product_id: string;
  name: string;
  slug: string;
  price: number;
  billing_interval?: PricingTier['billing_interval'];
  features?: string[];
  limits?: Record<string, any>;
  is_popular?: boolean;
  sort_order?: number;
}

export interface CreateSubscriptionInput {
  user_id: string;
  product_id: string;
  pricing_tier_id: string;
  stripe_subscription_id?: string;
  trial_start?: Date;
  trial_end?: Date;
  metadata?: Record<string, any>;
}

export interface CreateSaleInput {
  user_id?: string;
  lead_id?: string;
  subscription_id?: string;
  product_id: string;
  pricing_tier_id?: string;
  affiliate_id?: string;
  campaign_id?: string;
  amount: number;
  currency?: string;
  commission_amount?: number;
  tax_amount?: number;
  discount_amount?: number;
  payment_method?: string;
  transaction_type: Sale['transaction_type'];
  utm_data?: Record<string, any>;
  metadata?: Record<string, any>;
  stripe_payment_intent_id?: string;
  stripe_charge_id?: string;
}

export interface CreateAffiliateInput {
  user_id?: string;
  affiliate_code: string;
  company_name?: string;
  contact_email: string;
  contact_name?: string;
  website_url?: string;
  commission_rate?: number;
  commission_type?: Affiliate['commission_type'];
  payment_terms?: string;
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  is_active?: boolean;
}

export interface UpdateSubscriptionInput {
  status?: Subscription['status'];
  current_period_start?: Date;
  current_period_end?: Date;
  cancel_at_period_end?: boolean;
  canceled_at?: Date;
  ended_at?: Date;
  metadata?: Record<string, any>;
}

export interface UpdateAffiliateInput extends Partial<CreateAffiliateInput> {
  status?: Affiliate['status'];
  total_referrals?: number;
  total_sales?: number;
  total_commission?: number;
}

export interface SalesMetrics {
  total_revenue: number;
  total_sales: number;
  average_order_value: number;
  conversion_rate: number;
  monthly_recurring_revenue: number;
  annual_recurring_revenue: number;
  churn_rate: number;
  customer_lifetime_value: number;
}

export interface ProductMetrics {
  product_id: string;
  total_sales: number;
  total_revenue: number;
  active_subscriptions: number;
  conversion_rate: number;
  average_revenue_per_user: number;
}

export interface AffiliateMetrics {
  affiliate_id: string;
  total_clicks: number;
  total_conversions: number;
  conversion_rate: number;
  total_commission_earned: number;
  commission_pending: number;
  commission_paid: number;
} 