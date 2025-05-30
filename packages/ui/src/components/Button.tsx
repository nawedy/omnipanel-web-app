//# packages/ui/src/components/Button.tsx

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'warning';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  neonEffect?: boolean;
  glassmorphism?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      fullWidth = false,
      leftIcon,
      rightIcon,
      neonEffect = false,
      glassmorphism = false,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseClasses = clsx(
      // Base button styles
      'relative inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden',
      
      // Full width
      fullWidth && 'w-full',
      
      // Size variants
      {
        'px-2 py-1 text-xs min-h-[24px]': size === 'xs',
        'px-3 py-1.5 text-sm min-h-[32px]': size === 'sm',
        'px-4 py-2 text-sm min-h-[40px]': size === 'md',
        'px-6 py-3 text-base min-h-[48px]': size === 'lg',
        'px-8 py-4 text-lg min-h-[56px]': size === 'xl'
      },
      
      // Glassmorphism effect
      glassmorphism && [
        'backdrop-blur-md bg-white/10 border border-white/20',
        'dark:bg-gray-900/10 dark:border-gray-700/20'
      ],
      
      // Color variants
      !glassmorphism && {
        // Primary
        'bg-blue-600 hover:bg-blue-700 text-white border border-blue-600 hover:border-blue-700 focus:ring-blue-500': 
          variant === 'primary',
        
        // Secondary  
        'bg-gray-200 hover:bg-gray-300 text-gray-900 border border-gray-300 hover:border-gray-400 focus:ring-gray-500 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white dark:border-gray-600':
          variant === 'secondary',
        
        // Ghost
        'bg-transparent hover:bg-gray-100 text-gray-700 border border-transparent hover:border-gray-300 focus:ring-gray-500 dark:hover:bg-gray-800 dark:text-gray-300':
          variant === 'ghost',
        
        // Danger
        'bg-red-600 hover:bg-red-700 text-white border border-red-600 hover:border-red-700 focus:ring-red-500':
          variant === 'danger',
        
        // Success
        'bg-green-600 hover:bg-green-700 text-white border border-green-600 hover:border-green-700 focus:ring-green-500':
          variant === 'success',
        
        // Warning
        'bg-yellow-600 hover:bg-yellow-700 text-white border border-yellow-600 hover:border-yellow-700 focus:ring-yellow-500':
          variant === 'warning'
      },
      
      // Neon effect classes
      neonEffect && [
        'shadow-lg',
        variant === 'primary' && 'shadow-blue-500/30 hover:shadow-blue-500/50',
        variant === 'danger' && 'shadow-red-500/30 hover:shadow-red-500/50',
        variant === 'success' && 'shadow-green-500/30 hover:shadow-green-500/50',
        variant === 'warning' && 'shadow-yellow-500/30 hover:shadow-yellow-500/50'
      ]
    );

    const motionProps = {
      whileTap: disabled || loading ? {} : { scale: 0.98 },
      whileHover: disabled || loading ? {} : { 
        scale: 1.02,
        ...(neonEffect && {
          boxShadow: variant === 'primary' ? '0 0 20px rgba(59, 130, 246, 0.5)' :
                     variant === 'danger' ? '0 0 20px rgba(239, 68, 68, 0.5)' :
                     variant === 'success' ? '0 0 20px rgba(34, 197, 94, 0.5)' :
                     variant === 'warning' ? '0 0 20px rgba(234, 179, 8, 0.5)' :
                     '0 0 20px rgba(156, 163, 175, 0.5)'
        })
      },
      transition: { duration: 0.2 }
    };

    return (
      <motion.div
        {...motionProps}
        className="inline-block"
      >
        <button
        ref={ref}
        type={type}
        className={clsx(baseClasses, className)}
        disabled={disabled || loading}
        {...props}
      >
        {/* Glassmorphism shine effect */}
        {glassmorphism && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
        )}
        
        {/* Content */}
          <div className="relative flex items-center justify-center gap-2">
            {/* Left icon or loading spinner */}
          {loading ? (
            <Loader2 className={clsx(
              'animate-spin',
              size === 'xs' && 'h-3 w-3',
              size === 'sm' && 'h-4 w-4', 
              size === 'md' && 'h-4 w-4',
              size === 'lg' && 'h-5 w-5',
              size === 'xl' && 'h-6 w-6'
            )} />
          ) : (
            leftIcon && (
              <span className={clsx(
                'flex items-center',
                size === 'xs' && '[&>svg]:h-3 [&>svg]:w-3',
                size === 'sm' && '[&>svg]:h-4 [&>svg]:w-4',
                size === 'md' && '[&>svg]:h-4 [&>svg]:w-4',
                size === 'lg' && '[&>svg]:h-5 [&>svg]:w-5',
                size === 'xl' && '[&>svg]:h-6 [&>svg]:w-6'
              )}>
                {leftIcon}
              </span>
            )
          )}
          
          {children && (
            <span className={loading ? 'opacity-0' : 'opacity-100'}>
              {children}
            </span>
          )}
          
            {/* Right icon */}
            {rightIcon && !loading && (
            <span className={clsx(
              'flex items-center',
              size === 'xs' && '[&>svg]:h-3 [&>svg]:w-3',
              size === 'sm' && '[&>svg]:h-4 [&>svg]:w-4',
              size === 'md' && '[&>svg]:h-4 [&>svg]:w-4',
              size === 'lg' && '[&>svg]:h-5 [&>svg]:w-5',
              size === 'xl' && '[&>svg]:h-6 [&>svg]:w-6'
            )}>
              {rightIcon}
            </span>
          )}
          </div>
        
          {/* Neon pulse effect */}
        {neonEffect && (
          <motion.div
            className="absolute inset-0 rounded-lg opacity-0"
            animate={disabled || loading ? {} : {
              opacity: [0, 0.3, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              background: variant === 'primary' ? 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)' :
                         variant === 'danger' ? 'radial-gradient(circle, rgba(239, 68, 68, 0.3) 0%, transparent 70%)' :
                         variant === 'success' ? 'radial-gradient(circle, rgba(34, 197, 94, 0.3) 0%, transparent 70%)' :
                         variant === 'warning' ? 'radial-gradient(circle, rgba(234, 179, 8, 0.3) 0%, transparent 70%)' :
                         'radial-gradient(circle, rgba(156, 163, 175, 0.3) 0%, transparent 70%)'
            }}
          />
        )}
        </button>
      </motion.div>
    );
  }
);

Button.displayName = 'Button';

export { Button };