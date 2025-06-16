'use client';

import { CheckIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import React from 'react';
import { Card } from '@omnipanel/ui';

export interface PricingPlan {
  name: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  featured?: boolean;
}

interface PricingCardProps {
  plan: PricingPlan;
}

export function PricingCard({ plan }: PricingCardProps): React.JSX.Element {
  return (
    <div className="relative">
      {plan.featured && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
          <span className="inline-flex items-center rounded-full bg-primary-600 px-4 py-1 text-sm font-medium text-white">
            Most Popular
          </span>
        </div>
      )}
      
      <Card
        variant={plan.featured ? "elevated" : "default"}
        padding="lg"
        rounded="lg"
        shadow={plan.featured ? "lg" : "sm"}
        hover
        interactive
        neon={plan.featured}
        gradient={plan.featured}
        className={`pricing-card h-full ${plan.featured ? 'border-primary-500/50' : ''}`}
      >
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {plan.name}
          </h3>
          <div className="mt-4 flex items-baseline justify-center">
            <span className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
              {plan.price}
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {plan.description}
          </p>
        </div>

        <ul className="mt-8 space-y-3">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start">
              <CheckIcon className="h-5 w-5 text-primary-600 mt-0.5 mr-3 flex-shrink-0" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {feature}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-8">
          <Link
            href={plan.href}
            className={`block w-full rounded-lg px-4 py-3 text-center text-sm font-semibold transition-all ${
              plan.featured
                ? 'bg-primary-600 text-white hover:bg-primary-700 hover:scale-105'
                : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white ring-1 ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
          >
            {plan.cta}
          </Link>
        </div>
      </Card>
    </div>
  );
} 