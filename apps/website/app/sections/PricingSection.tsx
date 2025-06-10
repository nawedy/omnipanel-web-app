// Pricing Section Component - Comprehensive & Conversion Optimized
'use client';

import { motion } from 'framer-motion';
import { BentoGrid, BentoCard } from '@/components/magicui/bento-grid';
import { AnimatedBeam } from '@/components/magicui/animated-beam';
import { AuroraText } from '@/components/magicui/aurora-text';
import { AnimatedGradientText } from '@/components/magicui/animated-gradient-text';
import { AnimatedShinyText } from '@/components/magicui/animated-shiny-text';
import { Meteors } from '@/components/magicui/meteors';
import FeaturesComparisonTable from '@/app/sections/FeaturesComparisonTable';
import CostCalculatorSection from '@/app/sections/CostCalculatorSection';
import CountdownClock from '@/app/sections/CountdownClock';
import { Check, X, Crown, Shield, Users, Building, Zap, Clock, AlertTriangle, Calculator, TrendingUp, Star, ArrowRight, Download, Phone } from 'lucide-react';
import React, { useState } from 'react';
import { initial } from 'lodash';

// Pricing Data
export type PricingTier = {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  lifetimePrice: number;
  originalPrice: number;
  monthlyPrice: number;
  popular: boolean;
  features: string[];
  cta: string;
  note: string;
};

export const pricingTiers: PricingTier[] = [
  {
    id: 'early-believer',
    name: 'Early Believer',
    description: 'First 500 customers only',
    icon: Zap,
    lifetimePrice: 149,
    originalPrice: 499,
    monthlyPrice: 8,
    popular: true,
    features: [
      'Complete OmniPanel workspace',
      'AI Guardian security scanning',
      'Local AI model execution',
      'Lifetime updates included',
      'Beta access in 2 weeks',
      'Founding member status',
      'Priority support queue',
      '60-day money-back guarantee'
    ],
    cta: 'Save Developer Privacy - $149',
    note: 'Price increases to $199 in 47 hours'
  },
  {
    id: 'team',
    name: 'Team Security',
    description: '5-25 developers',
    icon: Users,
    lifetimePrice: 129,
    originalPrice: 299,
    monthlyPrice: 12,
    popular: false,
    features: [
      'Everything in Early Believer',
      'Team workspace management',
      'Shared security policies',
      'Admin dashboard access',
      'Team collaboration features',
      'Bulk license management',
      'Team training included',
      'Priority enterprise support'
    ],
    cta: 'Secure Team Privacy',
    note: 'Per seat pricing'
  },
  {
    id: 'enterprise',
    name: 'Enterprise Plus',
    description: '25+ developers',
    icon: Building,
    lifetimePrice: 99,
    originalPrice: 199,
    monthlyPrice: 15,
    popular: false,
    features: [
      'Everything in Team Security',
      'Air-gap deployment option',
      'Custom compliance integration',
      'Advanced audit trails',
      'White-label options',
      'Dedicated account manager',
      'Custom security auditing',
      '24/7 priority support'
    ],
    cta: 'Enterprise Demo',
    note: 'Volume discounts available'
  },
  {
    id: 'government',
    name: 'Government',
    description: 'Agencies & defense',
    icon: Shield,
    lifetimePrice: 299,
    originalPrice: 599,
    monthlyPrice: 25,
    popular: false,
    features: [
      'Everything in Enterprise Plus',
      'FedRAMP/FISMA compliance',
      'Classified environment ready',
      'No foreign dependencies',
      'Complete audit logging',
      'Security clearance compatible',
      'Custom implementation',
      'Government contract ready'
    ],
    cta: 'Contact Government Sales',
    note: 'Custom pricing for large deployments'
  }
];

export default function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<'lifetime' | 'monthly'>('lifetime');
  const [teamSize, setTeamSize] = useState(10);

  return (
    <section className="py-20 bg-gradient-to-b from-black/40 to-black/60">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          {/* Animated Beam with proper refs */}
          {(() => {
            const containerRef = React.useRef<HTMLDivElement | null>(null);
            const fromRef = React.useRef<HTMLDivElement | null>(null);
            const toRef = React.useRef<HTMLDivElement | null>(null);
            return (
              <div ref={containerRef} className="relative">
                <div ref={fromRef} className="absolute left-1/4 top-0" />
                <div ref={toRef} className="absolute right-1/4 top-0" />
                <AnimatedBeam containerRef={containerRef} fromRef={fromRef} toRef={toRef} className="mx-auto mb-6 max-w-lg" gradientStartColor="#a21caf" gradientStopColor="#7c3aed" />
              </div>
            );
          })()}
          <div className="inline-flex items-center px-4 py-2 bg-neon-purple/10 border border-neon-purple/20 rounded-full mb-6">
            <Crown className="w-5 h-5 text-neon-purple mr-2" />
            <span className="text-neon-purple font-medium">Emergency Pricing - 72 Hours Only</span>
          </div>
          <AuroraText className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Own Your AI Tools
            <AnimatedGradientText className="block">Forever</AnimatedGradientText>
          </AuroraText>
          <AnimatedShinyText className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-8">
            While competitors trap you in expensive subscriptions that harvest your data, 
            OmniPanel offers lifetime ownership with complete privacy protection.
          </AnimatedShinyText>
          {/* Countdown Clock Integration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="max-w-2xl mx-auto p-6 bg-red-500/10 border border-red-500/20 rounded-xl shadow-lg"
          >
            <div className="flex items-center justify-center space-x-4 text-red-400 mb-4">
              <Clock className="w-6 h-6 animate-pulse" />
              <CountdownClock targetDate={new Date(Date.now() + 72 * 60 * 60 * 1000)} className="font-bold text-2xl" finishedMessage="Emergency pricing has ended!" />
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <p className="text-red-300 text-lg">
              Emergency pricing increases to $199, then $249, then $499 at launch
            </p>
            <div className="mt-4 bg-red-500/20 rounded-full h-3">
              <div className="bg-red-500 h-3 rounded-full w-3/4 animate-pulse"></div>
            </div>
            <p className="text-red-300 text-sm mt-2">347 spots remaining at this price</p>
          </motion.div>
        </motion.div>

        {/* Billing Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center mb-12"
        >
          <div className="bg-gray-800 p-2 rounded-xl">
            <button
              onClick={() => setBillingCycle('lifetime')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                billingCycle === 'lifetime'
                  ? 'bg-neon-blue text-black'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Lifetime (Recommended)
            </button>
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-neon-blue text-black'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Monthly
            </button>
          </div>
        </motion.div>

        {/* Pricing Cards - Magic UI Bento Grid */}
        <BentoGrid className="mb-16">
          {pricingTiers.map((tier, index) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`relative h-full flex flex-col ${tier.popular ? 'lg:-mt-8 border-4 border-neon-purple/80 shadow-xl z-10' : ''}`}
            >
              <BentoCard
                name={tier.name}
                className="h-full"
                background={null}
                Icon={tier.icon}
                description={tier.description}
                href="#pricing"
                cta={tier.cta}
              />
            </motion.div>
          ))}
        </BentoGrid>

        {/* Cost Comparison Calculator */}
        <CostCalculatorSection />

        {/* Feature Comparison Table */}
        <FeaturesComparisonTable />

        {/* Enterprise Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Enterprise Package */}
            <div className="glass-card p-8">
              <div className="mb-6">
                <Building className="w-12 h-12 text-neon-purple mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Enterprise & Government</h3>
                <p className="text-gray-300">Custom solutions for large organizations</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-neon-green" />
                  <span className="text-gray-300">Air-gap deployment capability</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-neon-green" />
                  <span className="text-gray-300">Custom compliance integration</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-neon-green" />
                  <span className="text-gray-300">Dedicated security auditing</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-neon-green" />
                  <span className="text-gray-300">White-label options available</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-neon-green" />
                  <span className="text-gray-300">24/7 priority support</span>
                </div>
              </div>

              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-white mb-2">Custom Pricing</div>
                <div className="text-gray-300">Starting at $99/seat for 100+ users</div>
              </div>

              <button className="w-full btn btn-outline btn-lg">
                <Phone className="w-5 h-5 mr-2" />
                Schedule Enterprise Demo
              </button>
            </div>

            {/* Government Package */}
            <div className="glass-card p-8 border-neon-purple">
              <div className="mb-6">
                <Shield className="w-12 h-12 text-neon-purple mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Government & Defense</h3>
                <p className="text-gray-300">Security clearance ready solutions</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-neon-green" />
                  <span className="text-gray-300">FedRAMP and FISMA compliance</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-neon-green" />
                  <span className="text-gray-300">Classified environment deployment</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-neon-green" />
                  <span className="text-gray-300">No foreign dependencies</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-neon-green" />
                  <span className="text-gray-300">Complete audit trail logging</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-neon-green" />
                  <span className="text-gray-300">Security clearance compatible</span>
                </div>
              </div>

              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-white mb-2">$500K - $2M</div>
                <div className="text-gray-300">Per agency implementation</div>
              </div>

              <button className="w-full btn btn-primary btn-lg neon-glow">
                <Download className="w-5 h-5 mr-2" />
                Download Security Specifications
              </button>
            </div>
          </div>
        </motion.div>

        {/* Final CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <div className="glass-card p-8 md:p-12">
            <div className="mb-8">
              <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-4xl font-bold text-white mb-4">
                Don't Let This Opportunity Disappear
              </h3>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                After 72 hours, pricing increases and this privacy solution might be gone forever. 
                Join 500+ developers who've already secured their intellectual property protection.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-6 bg-gray-800/50 rounded-xl">
                <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">4.9/5</div>
                <div className="text-gray-300">Beta user rating</div>
              </div>
              <div className="text-center p-6 bg-gray-800/50 rounded-xl">
                <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">90%</div>
                <div className="text-gray-300">Development complete</div>
              </div>
              <div className="text-center p-6 bg-gray-800/50 rounded-xl">
                <Shield className="w-8 h-8 text-neon-blue mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">100%</div>
                <div className="text-gray-300">Security focused</div>
              </div>
            </div>
            <p className="text-sm text-gray-400 mt-6">
              60-day money-back guarantee • Beta access in 2 weeks • Full product in 6 weeks
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
