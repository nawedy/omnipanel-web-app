// Strictly typed pricing plan data for homepage integration
import type { PricingPlan } from '@/components/PricingCard';

export const pricingPlans: PricingPlan[] = [
  {
    name: 'Free',
    price: '$0',
    description: 'Basic access to AI chat and code features. Great for individuals.',
    features: [
      'Unlimited AI chat',
      'Basic code editing',
      'Community support',
    ],
    cta: 'Get Started',
    href: '/signup',
  },
  {
    name: 'Pro',
    price: '$19/mo',
    description: 'Advanced features for professionals and teams.',
    features: [
      'Everything in Free',
      'Priority support',
      'Team collaboration',
      'Advanced model integrations',
    ],
    cta: 'Upgrade to Pro',
    href: '/signup',
    featured: true,
  },
  {
    name: 'Enterprise',
    price: 'Contact Us',
    description: 'Custom solutions and dedicated support for organizations.',
    features: [
      'Everything in Pro',
      'Custom integrations',
      'Dedicated account manager',
      'SLAs & compliance',
    ],
    cta: 'Contact Sales',
    href: '/contact',
  },
];
