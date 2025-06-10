'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface Feature {
  name: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
}

export interface FeatureCardProps {
  feature: Feature;
  index: number;
  inView: boolean;
}

const colorClasses: Record<string, string> = {
  blue: 'text-blue-600',
  green: 'text-green-600',
  purple: 'text-purple-600',
  orange: 'text-orange-600',
  red: 'text-red-600',
  teal: 'text-teal-600',
  pink: 'text-pink-600',
  indigo: 'text-indigo-600',
  yellow: 'text-yellow-600',
};

export interface Feature {
  name: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
}

export interface FeatureCardProps {
  feature: Feature;
  index: number;
  inView: boolean;
}


export function FeatureCard({ feature, index, inView }: FeatureCardProps): React.JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white dark:bg-gray-900 p-6 h-full flex flex-col justify-between rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-md transition-all"
    >
      <div>
        <div className="flex items-center justify-center h-12 w-12 rounded-md bg-gray-100 dark:bg-gray-800 mb-4">
          <feature.icon 
            className={`h-6 w-6 ${colorClasses[feature.color as keyof typeof colorClasses]}`} 
            aria-hidden="true" 
          />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{feature.name}</h3>
        <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
      </div>
    </motion.div>
  );
} 