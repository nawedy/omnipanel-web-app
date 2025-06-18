// Pricing Section Component - Optimized & Performance Enhanced
'use client';

import React, { useState, useRef, useMemo, useCallback } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Check, Zap, Shield, Users, Crown, Rocket, Lock, Sparkles, ArrowRight, Calculator } from 'lucide-react';
import { BentoGrid, BentoCard } from '@/components/magicui/bento-grid';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Meteors } from '@/components/magicui/meteors';

// Enhanced pricing plan interface
interface OptimizedPricingPlan {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  price: number;
  yearlyPrice?: number;
  originalPrice?: number;
  period: 'month' | 'year' | 'one-time';
  features: string[];
  highlightedFeatures?: string[];
  cta: string;
  ctaVariant?: 'default' | 'secondary' | 'outline';
  badge?: string;
  icon?: React.ComponentType<any>;
  gradient: string;
  borderGradient?: string;
  popular?: boolean;
  enterprise?: boolean;
  savings?: number;
}

// Optimized pricing data with better structure
const optimizedPricingPlans: OptimizedPricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for individual developers getting started',
    shortDescription: 'Individual developers',
    price: 29,
    yearlyPrice: 290,
    originalPrice: 49,
    period: 'month',
    features: [
      'Unlimited AI conversations',
      'Code completion & suggestions',
      'Local AI execution',
      'Privacy protection',
      'VS Code integration',
      'Basic security scanning',
      'Community support',
      '5GB cloud storage'
    ],
    highlightedFeatures: ['Unlimited AI conversations', 'Privacy protection'],
    cta: 'Start Free Trial',
    ctaVariant: 'outline',
    icon: Zap,
    gradient: 'from-blue-500/20 to-cyan-500/20',
    borderGradient: 'from-blue-500 to-cyan-500',
    savings: 20
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'For serious developers who need advanced features',
    shortDescription: 'Professional developers',
    price: 79,
    yearlyPrice: 790,
    originalPrice: 99,
    period: 'month',
    features: [
      'Everything in Starter',
      'Advanced AI models',
      'Custom model training',
      'Advanced security scanning',
      'Priority support',
      'Team collaboration (up to 5)',
      'Advanced debugging tools',
      '50GB cloud storage',
      'API access',
      'Custom integrations'
    ],
    highlightedFeatures: ['Advanced AI models', 'Custom model training', 'Team collaboration'],
    cta: 'Start Free Trial',
    ctaVariant: 'default',
    badge: 'Most Popular',
    icon: Shield,
    gradient: 'from-purple-500/20 to-pink-500/20',
    borderGradient: 'from-purple-500 to-pink-500',
    popular: true,
    savings: 20
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Unlimited power for large teams and organizations',
    shortDescription: 'Large teams & organizations',
    price: 299,
    yearlyPrice: 2990,
    period: 'month',
    features: [
      'Everything in Professional',
      'Unlimited team members',
      'On-premises deployment',
      'SOC 2 compliance',
      'SAML/SSO integration',
      '24/7 dedicated support',
      'Custom SLA',
      'Unlimited storage',
      'Advanced analytics',
      'White-label options',
      'Custom AI model hosting',
      'Enterprise API limits'
    ],
    highlightedFeatures: ['Unlimited team members', 'On-premises deployment', 'SOC 2 compliance'],
    cta: 'Contact Sales',
    ctaVariant: 'secondary',
    badge: 'Enterprise',
    icon: Crown,
    gradient: 'from-orange-500/20 to-red-500/20',
    borderGradient: 'from-orange-500 to-red-500',
    enterprise: true
  }
];

interface PricingCardProps {
  plan: OptimizedPricingPlan;
  billingCycle: 'monthly' | 'yearly';
  index: number;
  onSelect?: (plan: OptimizedPricingPlan) => void;
}

// Memoized pricing card component for better performance
const PricingCard: React.FC<PricingCardProps> = React.memo(({ plan, billingCycle, index, onSelect }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: "-100px" });
  
  // Memoized price calculation
  const currentPrice = useMemo(() => {
    if (billingCycle === 'yearly' && plan.yearlyPrice) {
      return Math.round(plan.yearlyPrice / 12);
    }
    return plan.price;
  }, [plan.price, plan.yearlyPrice, billingCycle]);

  const yearlyTotal = useMemo(() => {
    return billingCycle === 'yearly' && plan.yearlyPrice ? plan.yearlyPrice : plan.price * 12;
  }, [plan.price, plan.yearlyPrice, billingCycle]);

  const monthlySavings = useMemo(() => {
    if (billingCycle === 'yearly' && plan.yearlyPrice) {
      return plan.price - Math.round(plan.yearlyPrice / 12);
    }
    return 0;
  }, [plan.price, plan.yearlyPrice, billingCycle]);

  const handleSelectPlan = useCallback(() => {
    onSelect?.(plan);
  }, [plan, onSelect]);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={isInView ? { opacity: 1, y: 0, scale: plan.popular ? 1.05 : 1 } : { opacity: 0, y: 50, scale: 0.9 }}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.1,
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      whileHover={{ 
        scale: plan.popular ? 1.08 : 1.03,
        transition: { duration: 0.2 }
      }}
      className={cn(
        "relative overflow-hidden",
        plan.popular && "z-10"
      )}
    >
      <Card className={cn(
        "relative h-full bg-gradient-to-br border-2 transition-all duration-300 flex flex-col",
        plan.gradient,
        plan.popular 
          ? `border-purple-500/50 shadow-2xl shadow-purple-500/20` 
          : "border-slate-700/40 hover:border-slate-600/60",
        "backdrop-blur-sm hover:shadow-xl"
      )}>
        {/* Popular Badge - Fixed positioning */}
        {plan.badge && (
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-30">
            <Badge className={cn(
              "px-4 py-2 text-sm font-semibold shadow-lg border-2",
              plan.popular 
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-300 shadow-purple-500/50" 
                : "bg-gradient-to-r from-orange-500 to-red-500 text-white border-orange-300 shadow-orange-500/50"
            )}>
              {plan.badge}
            </Badge>
          </div>
        )}

        <CardHeader className="pb-4 flex-shrink-0 pt-8">
          <div className="flex items-center gap-3 mb-4">
            <div className={cn(
              "p-3 rounded-xl bg-gradient-to-br",
              plan.popular ? "from-purple-500/30 to-pink-500/30" : "from-slate-700/30 to-slate-600/30"
            )}>
              {plan.icon && <plan.icon className="w-6 h-6 text-white" />}
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-white">{plan.name}</CardTitle>
              <p className="text-sm text-slate-300">{plan.shortDescription}</p>
            </div>
          </div>

          {/* Pricing Display */}
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-white">${currentPrice}</span>
              <span className="text-slate-300">/{plan.period === 'one-time' ? 'once' : 'month'}</span>
            </div>
            
            {billingCycle === 'yearly' && (
              <div className="space-y-1">
                <p className="text-sm text-slate-400">
                  Billed yearly: ${yearlyTotal}
                </p>
                {monthlySavings > 0 && (
                  <Badge variant="secondary" className="bg-green-500/20 text-green-400 text-xs">
                    Save ${monthlySavings}/month
                  </Badge>
                )}
              </div>
            )}

            {plan.originalPrice && billingCycle === 'monthly' && (
              <div className="flex items-center gap-2">
                <span className="text-lg text-slate-400 line-through">${plan.originalPrice}</span>
                <Badge variant="secondary" className="bg-green-500/20 text-green-400 text-xs">
                  Save ${plan.originalPrice - plan.price}
                </Badge>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex flex-col flex-grow space-y-6">
          <p className="text-slate-300 text-sm">{plan.description}</p>

          {/* Features List */}
          <div className="space-y-3 flex-grow">
            <h4 className="text-white font-semibold text-sm">What's included:</h4>
            <ul className="space-y-2">
              {plan.features.slice(0, 8).map((feature, featureIndex) => (
                <li key={featureIndex} className="flex items-start gap-3 text-sm">
                  <Check className={cn(
                    "w-4 h-4 mt-0.5 flex-shrink-0",
                    plan.highlightedFeatures?.includes(feature) 
                      ? "text-green-400" 
                      : "text-slate-400"
                  )} />
                  <span className={cn(
                    plan.highlightedFeatures?.includes(feature) 
                      ? "text-white font-medium" 
                      : "text-slate-200"
                  )}>
                    {feature}
                  </span>
                </li>
              ))}
              {plan.features.length > 8 && (
                <li className="flex items-center gap-2 text-sm text-slate-400">
                  <Sparkles className="w-4 h-4" />
                  <span>+{plan.features.length - 8} more features</span>
                </li>
              )}
            </ul>
          </div>

          {/* CTA Button - Always at bottom */}
          <div className="mt-auto space-y-3">
            <Button
              onClick={handleSelectPlan}
              variant={plan.ctaVariant || 'default'}
              size="lg"
              className={cn(
                "w-full font-semibold transition-all duration-300 group",
                plan.popular
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-purple-500/30"
                  : plan.enterprise
                  ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                  : "bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
              )}
            >
              {plan.cta}
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>

            {plan.enterprise && (
              <p className="text-xs text-slate-400 text-center">
                Custom pricing available for large teams
              </p>
            )}
          </div>
        </CardContent>

        {/* Meteors Effect for Popular Plan */}
        {plan.popular && <Meteors number={8} />}
      </Card>
    </motion.div>
  );
});

PricingCard.displayName = 'PricingCard';

// Pricing calculator component
const PricingCalculator: React.FC<{
  billingCycle: 'monthly' | 'yearly';
  onBillingChange: (cycle: 'monthly' | 'yearly') => void;
}> = ({ billingCycle, onBillingChange }) => {
  const yearlyDiscount = 20;
  
  return (
    <div className="flex flex-col items-center gap-4 mb-12">
      <div className="flex items-center gap-4 p-2 bg-slate-800/40 rounded-xl border border-slate-700/40">
        <Button
          variant={billingCycle === 'monthly' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onBillingChange('monthly')}
          className={cn(
            "transition-all duration-200",
            billingCycle === 'monthly' ? "bg-purple-500 hover:bg-purple-600" : "text-slate-300 hover:text-white"
          )}
        >
          Monthly
        </Button>
        <Button
          variant={billingCycle === 'yearly' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onBillingChange('yearly')}
          className={cn(
            "transition-all duration-200 relative",
            billingCycle === 'yearly' ? "bg-purple-500 hover:bg-purple-600" : "text-slate-300 hover:text-white"
          )}
        >
          Yearly
          <Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1 py-0">
            -{yearlyDiscount}%
          </Badge>
        </Button>
      </div>
      
      {billingCycle === 'yearly' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2"
        >
          <Calculator className="w-4 h-4 text-green-400" />
          <span className="text-sm text-green-400 font-medium">
            Save up to ${Math.round((79 * 12 * yearlyDiscount) / 100)} per year with yearly billing
          </span>
        </motion.div>
      )}
    </div>
  );
};

// Enhanced bento items with better performance
const bentoItems = [
  {
    id: 'security',
    title: "AI Guardian Protection",
    description: "Real-time security scanning and threat detection for all your code",
    icon: Shield,
    gradient: "from-blue-500/20 to-cyan-500/20",
    features: ['Real-time scanning', 'Threat detection', 'Vulnerability alerts']
  },
  {
    id: 'privacy',
    title: "100% Local Execution", 
    description: "Your code never leaves your machine - complete privacy guaranteed",
    icon: Lock,
    gradient: "from-green-500/20 to-emerald-500/20",
    features: ['Local processing', 'No data harvesting', 'Complete privacy']
  },
  {
    id: 'support',
    title: "Multi-Platform Support",
    description: "Works seamlessly across Windows, macOS, and Linux", 
    icon: Users,
    gradient: "from-purple-500/20 to-pink-500/20",
    features: ['Cross-platform', 'Universal compatibility', 'Seamless sync']
  },
  {
    id: 'performance',
    title: "Lightning Fast Performance",
    description: "Optimized for speed with advanced caching and efficient algorithms",
    icon: Rocket,
    gradient: "from-orange-500/20 to-red-500/20",
    features: ['Advanced caching', 'Optimized algorithms', 'Lightning speed']
  }
];

const PricingSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [_selectedPlan, setSelectedPlan] = useState<OptimizedPricingPlan | null>(null);

  const handleBillingToggle = useCallback((cycle: 'monthly' | 'yearly') => {
    setBillingCycle(cycle);
  }, []);

  const handlePlanSelect = useCallback((plan: OptimizedPricingPlan) => {
    setSelectedPlan(plan);
    // Here you would typically handle the plan selection (e.g., redirect to checkout)
    console.log('Selected plan:', plan);
  }, []);

  // Memoized calculations for performance
  const totalYearlySavings = useMemo(() => {
    return optimizedPricingPlans.reduce((total, plan) => {
      if (plan.yearlyPrice) {
        const monthlyCost = plan.price * 12;
        const yearlyCost = plan.yearlyPrice;
        return total + (monthlyCost - yearlyCost);
      }
      return total;
    }, 0);
  }, []);

  return (
    <section 
      ref={sectionRef} 
      className="py-24 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden"
      aria-labelledby="pricing-heading"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 
            id="pricing-heading"
            className="text-4xl md:text-6xl font-bold text-white mb-6"
          >
            Choose Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-red-400">
              Perfect Plan
            </span>
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8">
            From individual developers to enterprise teams, we have the perfect solution to supercharge your development workflow with AI.
          </p>

          <PricingCalculator 
            billingCycle={billingCycle} 
            onBillingChange={handleBillingToggle} 
          />
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          <AnimatePresence mode="wait">
            {optimizedPricingPlans.map((plan, index) => (
              <PricingCard
                key={`${plan.id}-${billingCycle}`}
                plan={plan}
                billingCycle={billingCycle}
                index={index}
                onSelect={handlePlanSelect}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* All Plans Include Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mb-16"
        >
          <h3 className="text-3xl font-bold text-white mb-4">
            All Plans Include These Essentials
          </h3>
          <p className="text-slate-400 mb-12 max-w-2xl mx-auto">
            Every plan comes with our core features designed to enhance your development experience
          </p>
          
          <BentoGrid className="max-w-6xl mx-auto grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {bentoItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <BentoCard
                  name={item.title}
                  className="col-span-1 h-full"
                  background={
                    <div className={cn(
                      "h-32 bg-gradient-to-br rounded-lg flex items-center justify-center relative overflow-hidden",
                      item.gradient
                    )}>
                      <item.icon className="w-8 h-8 text-white z-10" />
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                    </div>
                  }
                  Icon={item.icon}
                  description={item.description}
                  href="#pricing"
                  cta="Learn More"
                />
              </motion.div>
            ))}
          </BentoGrid>
        </motion.div>

        {/* Savings Highlight */}
        {billingCycle === 'yearly' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <Card className="max-w-md mx-auto bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <Sparkles className="w-6 h-6 text-green-400" />
                  <h4 className="text-xl font-bold text-white">Yearly Savings</h4>
                </div>
                <p className="text-3xl font-bold text-green-400 mb-2">
                  ${totalYearlySavings}
                </p>
                <p className="text-sm text-slate-300">
                  Total savings with yearly billing across all plans
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-pink-500/5" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" 
           style={{ animationDelay: '1s' }} />
    </section>
  );
};

export default PricingSection;
