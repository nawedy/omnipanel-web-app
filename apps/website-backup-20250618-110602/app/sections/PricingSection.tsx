// Pricing Section Component - Comprehensive & Conversion Optimized
'use client';

import React, { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Check, Zap, Shield, Users, Star, Crown, Rocket, Lock } from 'lucide-react';
import { BentoGrid, BentoCard } from '@/components/magicui/bento-grid';
import { cn } from '@/lib/utils';
import { pricingPlans } from '@/data/pricingPlans';
import { Meteors } from '@/components/magicui/meteors';

interface PricingCardProps {
  plan: typeof pricingPlans[0];
  isPopular?: boolean;
  index: number;
}

const PricingCard: React.FC<PricingCardProps> = ({ plan, isPopular, index }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: "-100px" });

  const getIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'starter': return <Zap className="w-6 h-6" />;
      case 'professional': return <Shield className="w-6 h-6" />;
      case 'enterprise': return <Crown className="w-6 h-6" />;
      default: return <Star className="w-6 h-6" />;
    }
  };

  const getGradient = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'starter': return 'from-neon-blue/20 to-neon-green/20';
      case 'professional': return 'from-neon-purple/20 to-neon-blue/20';
      case 'enterprise': return 'from-neon-yellow/20 to-neon-purple/20';
      default: return 'from-neon-blue/20 to-neon-green/20';
    }
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className={cn(
        "relative p-8 rounded-2xl border bg-gradient-to-br",
        getGradient(plan.name),
        isPopular 
          ? "border-neon-blue/50 shadow-2xl shadow-neon-blue/20 scale-105" 
          : "border-white/10 hover:border-white/20",
        "transition-all duration-300 hover:shadow-xl backdrop-blur-sm"
      )}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-r from-neon-blue to-neon-purple text-white px-4 py-2 rounded-full text-sm font-semibold">
            Most Popular
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 mb-6">
        <div className={cn(
          "p-3 rounded-xl bg-gradient-to-br",
          isPopular ? "from-neon-blue/30 to-neon-purple/30" : "from-white/10 to-white/5"
        )}>
          {getIcon(plan.name)}
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
          <p className="text-gray-300">{plan.description}</p>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-white">${plan.price}</span>
          <span className="text-gray-300">/{plan.period}</span>
        </div>
        {plan.originalPrice && (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-lg text-gray-400 line-through">${plan.originalPrice}</span>
            <span className="text-sm bg-neon-green/20 text-neon-green px-2 py-1 rounded-full">
              Save ${plan.originalPrice - plan.price}
            </span>
          </div>
        )}
      </div>

      <ul className="space-y-4 mb-8">
        {plan.features.map((feature, featureIndex) => (
          <li key={featureIndex} className="flex items-start gap-3">
            <Check className="w-5 h-5 text-neon-green mt-0.5 flex-shrink-0" />
            <span className="text-gray-200">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        className={cn(
          "w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300",
          isPopular
            ? "bg-gradient-to-r from-neon-blue to-neon-purple text-white hover:shadow-lg hover:shadow-neon-blue/30"
            : "bg-white/10 text-white hover:bg-white/20 border border-white/20"
        )}
      >
        {plan.cta}
      </button>

      {isPopular && <Meteors number={6} />}
    </motion.div>
  );
};

const PricingSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const handleBillingToggle = () => {
    setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly');
  };

  const bentoItems = [
    {
      title: "AI Guardian Protection",
      description: "Real-time security scanning and threat detection for all your code",
      icon: Shield,
      gradient: "from-neon-blue/20 to-neon-green/20"
    },
    {
      title: "100% Local Execution", 
      description: "Your code never leaves your machine - complete privacy guaranteed",
      icon: Lock,
      gradient: "from-neon-green/20 to-neon-yellow/20"
    },
    {
      title: "Multi-Platform Support",
      description: "Works seamlessly across Windows, macOS, and Linux", 
      icon: Users,
      gradient: "from-neon-purple/20 to-neon-blue/20"
    },
    {
      title: "Lightning Fast Performance",
      description: "Optimized for speed with advanced caching and efficient algorithms",
      icon: Rocket,
      gradient: "from-neon-yellow/20 to-neon-purple/20"
    }
  ];

  return (
    <section ref={sectionRef} className="py-24 bg-gradient-to-b from-black/40 to-black/60 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple">Security Level</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            From individual developers to enterprise teams, we have the perfect plan to keep your code secure and your productivity high.
          </p>

          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={cn("text-lg", billingCycle === 'monthly' ? "text-white" : "text-gray-400")}>
              Monthly
            </span>
            <button
              onClick={handleBillingToggle}
              className="relative w-16 h-8 bg-gray-600 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-neon-blue"
            >
              <div
                className={cn(
                  "absolute top-1 w-6 h-6 bg-white rounded-full transition-transform duration-300",
                  billingCycle === 'yearly' ? "translate-x-9" : "translate-x-1"
                )}
              />
            </button>
            <span className={cn("text-lg", billingCycle === 'yearly' ? "text-white" : "text-gray-400")}>
              Yearly
            </span>
            <span className="bg-neon-green/20 text-neon-green px-3 py-1 rounded-full text-sm font-semibold">
              Save 20%
            </span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {pricingPlans.map((plan, index) => (
            <PricingCard
              key={plan.name}
              plan={plan}
              isPopular={plan.name === 'Professional'}
              index={index}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center"
        >
          <h3 className="text-2xl font-bold text-white mb-8">
            All Plans Include
          </h3>
          
          <BentoGrid className="max-w-4xl mx-auto grid-cols-1 md:grid-cols-2">
            {bentoItems.map((item, index) => (
              <BentoCard
                key={item.title}
                name={item.title}
                className={cn("col-span-1", index === 0 || index === 3 ? "md:col-span-2" : "")}
                background={
                  <div className={cn("h-32 bg-gradient-to-br rounded-lg flex items-center justify-center", item.gradient)}>
                    <item.icon className="w-12 h-12 text-white" />
                  </div>
                }
                Icon={item.icon}
                description={item.description}
                href="#pricing"
                cta="Learn More"
              />
            ))}
          </BentoGrid>
        </motion.div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/5 via-transparent to-neon-purple/5" />
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-neon-blue/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-neon-purple/10 rounded-full blur-3xl" />
    </section>
  );
};

export default PricingSection;
