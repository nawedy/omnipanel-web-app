'use client';

import React from 'react';
import { Check, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PricingPlan {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  period: string;
  features: string[];
  cta: string;
  popular?: boolean;
}

interface PricingCardProps {
  plan: PricingPlan;
  className?: string;
}

export function PricingCard({ plan, className }: PricingCardProps): React.JSX.Element {
  return (
    <div
      className={cn(
        "relative p-8 rounded-2xl border bg-gradient-to-br",
        plan.popular 
          ? "border-neon-blue/50 shadow-2xl shadow-neon-blue/20 scale-105 from-neon-purple/20 to-neon-blue/20" 
          : "border-white/10 hover:border-white/20 from-neon-blue/20 to-neon-green/20",
        "transition-all duration-300 hover:shadow-xl backdrop-blur-sm",
        className
      )}
    >
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-r from-neon-blue to-neon-purple text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
            <Crown className="w-4 h-4" />
            Most Popular
          </div>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
        <p className="text-gray-300">{plan.description}</p>
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
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <Check className="w-5 h-5 text-neon-green mt-0.5 flex-shrink-0" />
            <span className="text-gray-200">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        className={cn(
          "w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300",
          plan.popular
            ? "bg-gradient-to-r from-neon-blue to-neon-purple text-white hover:shadow-lg hover:shadow-neon-blue/30"
            : "bg-white/10 text-white hover:bg-white/20 border border-white/20"
        )}
      >
        {plan.cta}
      </button>
    </div>
  );
} 