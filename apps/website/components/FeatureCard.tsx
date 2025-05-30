'use client';

import { motion } from 'framer-motion';

interface Feature {
  name: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
}

interface FeatureCardProps {
  feature: Feature;
  index: number;
  inView: boolean;
}

const colorClasses = {
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

export function FeatureCard({ feature, index, inView }: FeatureCardProps): JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="feature-card"
    >
      <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 dark:text-white">
        <feature.icon 
          className={`h-5 w-5 flex-none ${colorClasses[feature.color as keyof typeof colorClasses] || 'text-primary-600'}`} 
          aria-hidden="true" 
        />
        {feature.name}
      </dt>
      <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-300">
        <p className="flex-auto">{feature.description}</p>
      </dd>
    </motion.div>
  );
} 