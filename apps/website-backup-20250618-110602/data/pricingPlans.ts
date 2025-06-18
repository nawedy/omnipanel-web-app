// apps/website/data/pricingPlans.ts
// Complete pricing plans data for OmniPanel website

export interface PricingPlan {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  period: string;
  features: string[];
  cta: string;
  popular?: boolean;
}

export const pricingPlans: PricingPlan[] = [
  {
    name: 'Starter',
    description: 'Perfect for individual developers',
    price: 29,
    originalPrice: 49,
    period: 'month',
    features: [
      'AI Guardian security scanning',
      '100% local AI execution',
      'Basic code analysis',
      'Email support',
      'Up to 5 projects',
      'Standard encryption',
      'Community access',
      '30-day money-back guarantee'
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    name: 'Professional',
    description: 'Best for growing teams',
    price: 79,
    originalPrice: 129,
    period: 'month',
    features: [
      'Everything in Starter',
      'Advanced threat detection',
      'Team collaboration tools',
      'Priority support',
      'Unlimited projects',
      'Enterprise-grade encryption',
      'Custom security policies',
      'Advanced analytics dashboard',
      'API access',
      'White-label options'
    ],
    cta: 'Start Professional',
    popular: true,
  },
  {
    name: 'Enterprise',
    description: 'For large organizations',
    price: 199,
    originalPrice: 299,
    period: 'month',
    features: [
      'Everything in Professional',
      'Air-gap deployment',
      'Custom compliance integration',
      'Dedicated account manager',
      'SLA guarantees',
      'Advanced audit trails',
      'Custom training',
      '24/7 phone support',
      'On-premise deployment',
      'Custom integrations',
      'Volume discounts available'
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];
