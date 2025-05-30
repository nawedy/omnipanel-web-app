//# packages/ui/src/components/Card.tsx

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  border?: boolean;
  hover?: boolean;
  interactive?: boolean;
  loading?: boolean;
  disabled?: boolean;
  glassmorphism?: boolean;
  gradient?: boolean;
  neon?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      className,
      variant = 'default',
      padding = 'md',
      rounded = 'md',
      shadow = 'sm',
      border = true,
      hover = false,
      interactive = false,
      loading = false,
      disabled = false,
      glassmorphism = false,
      gradient = false,
      neon = false,
      ...props
    },
    ref
  ) => {
    const cardClasses = clsx(
      // Base styles
      'relative overflow-hidden transition-all duration-200',
      
      // Variant styles
      {
        // Default
        'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100': variant === 'default',
        
        // Outlined
        'bg-transparent border-2 text-gray-900 dark:text-gray-100': variant === 'outlined',
        
        // Elevated - with enhanced shadow and slight background difference
        'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-lg': variant === 'elevated',
        
        // Filled
        'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100': variant === 'filled'
      },
      
      // Padding variants
      {
        'p-0': padding === 'none',
        'p-2': padding === 'sm',
        'p-4': padding === 'md',
        'p-6': padding === 'lg',
        'p-8': padding === 'xl'
      },
      
      // Rounded variants
      {
        'rounded-none': rounded === 'none',
        'rounded-sm': rounded === 'sm',
        'rounded-md': rounded === 'md',
        'rounded-lg': rounded === 'lg',
        'rounded-xl': rounded === 'xl',
        'rounded-full': rounded === 'full'
      },
      
      // Shadow variants (only apply if not elevated variant which has its own shadow)
      variant !== 'elevated' && {
        'shadow-none': shadow === 'none',
        'shadow-sm': shadow === 'sm',
        'shadow-md': shadow === 'md',
        'shadow-lg': shadow === 'lg',
        'shadow-xl': shadow === 'xl'
      },
      
      // Border
      border && 'border border-gray-200 dark:border-gray-700',
      
      // Interactive states
      interactive && 'cursor-pointer',
      hover && 'hover:shadow-lg hover:scale-[1.02]',
      disabled && 'opacity-50 cursor-not-allowed',
      
      // Special effects
      glassmorphism && [
        'backdrop-blur-md bg-white/10 border border-white/20',
        'dark:bg-gray-900/10 dark:border-gray-700/20'
      ],
      
      gradient && 'bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900',
      
      neon && [
        'border-blue-500/50 shadow-lg shadow-blue-500/25',
        'hover:shadow-blue-500/50 hover:border-blue-400'
      ]
    );

    const motionProps = {
      whileHover: interactive && !disabled ? { 
        scale: 1.02,
        transition: { duration: 0.2 }
      } : {},
      whileTap: interactive && !disabled ? { 
        scale: 0.98,
        transition: { duration: 0.1 }
      } : {},
      transition: { duration: 0.2 }
    };

    return (
      <motion.div
        {...motionProps}
        className="inline-block w-full"
      >
        <div
          ref={ref}
          className={clsx(cardClasses, className)}
          {...props}
        >
          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 flex items-center justify-center z-10">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        )}
        
        {/* Glassmorphism shine effect */}
        {glassmorphism && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
        )}
        
        {/* Neon glow effect */}
          {neon && (
          <motion.div
            className="absolute inset-0 rounded-lg opacity-0"
              animate={{
                opacity: [0, 0.3, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)'
            }}
          />
        )}

          {children}
        </div>
      </motion.div>
    );
  }
);

Card.displayName = 'Card';

// Pre-built card variants
export const StatCard: React.FC<{
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}> = ({
  title,
  value,
  description,
  icon,
  trend,
  className
}) => {
  return (
    <Card
      variant="elevated"
      padding="lg"
      interactive
      neon
      className={className}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {value}
          </p>
          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {description}
            </p>
          )}
          {trend && (
            <div className={clsx(
              'flex items-center gap-1 mt-2 text-xs font-medium',
              trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            )}>
              <span>{trend.isPositive ? '↗' : '↘'}</span>
              {Math.abs(trend.value)}%
            </div>
          )}
        </div>
        {icon && (
          <div className="text-blue-500 dark:text-blue-400">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};

export const FeatureCard: React.FC<{
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}> = ({
  title,
  description,
  icon,
  action,
  className
}) => {
  return (
    <Card
      variant="default"
      padding="lg"
      interactive
      glassmorphism
      neon
      className={className}
    >
      {icon && (
        <div className="text-blue-500 dark:text-blue-400 mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        {description}
      </p>
      {action && action}
    </Card>
  );
};

export { Card };

// Example usage components
export const BasicCard: React.FC<{ className?: string; children: React.ReactNode }> = ({ 
  className, 
  children 
}) => (
  <Card
    variant="default"
    padding="lg"
    interactive
    neon
    className={className}
  >
    {children}
  </Card>
);

export const GlassCard: React.FC<{ className?: string; children: React.ReactNode }> = ({ 
  className, 
  children 
}) => (
  <Card
    variant="default"
    padding="lg"
    interactive
    glassmorphism
    neon
    className={className}
  >
    {children}
  </Card>
);