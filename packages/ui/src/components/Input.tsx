//# packages/ui/src/components/Input.tsx

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { clsx } from 'clsx';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  variant?: 'default' | 'ghost' | 'bordered';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
  glassmorphism?: boolean;
  neonFocus?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      label,
      description,
      error,
      success,
      variant = 'default',
      size = 'md',
      fullWidth = false,
      leftIcon,
      rightIcon,
      loading = false,
      disabled,
      glassmorphism = false,
      neonFocus = false,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;
    const hasError = !!error;
    const hasSuccess = !!success && !hasError;

    const containerClasses = clsx(
      'relative',
      fullWidth && 'w-full'
    );

    const inputClasses = clsx(
      // Base styles
      'w-full rounded-lg transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-0',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'placeholder:text-gray-400 dark:placeholder:text-gray-500',
      
      // Glassmorphism
      glassmorphism && [
        'backdrop-blur-md border border-white/20',
        'bg-white/10 dark:bg-white/5 text-white'
      ],
      
      // Size variants
      {
        'px-3 py-1.5 text-sm': size === 'sm',
        'px-4 py-2 text-sm': size === 'md', 
        'px-5 py-3 text-base': size === 'lg'
      },
      
      // Icon padding
      leftIcon && {
        'pl-9': size === 'sm',
        'pl-10': size === 'md',
        'pl-12': size === 'lg'
      },
      
      (rightIcon || isPassword) && {
        'pr-9': size === 'sm',
        'pr-10': size === 'md', 
        'pr-12': size === 'lg'
      },
      
      // Variant styles (when not glassmorphism)
      !glassmorphism && {
        // Default
        'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white':
          variant === 'default' && !hasError && !hasSuccess,
        
        // Ghost
        'bg-transparent border border-transparent text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50':
          variant === 'ghost' && !hasError && !hasSuccess,
        
        // Bordered
        'bg-transparent border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white':
          variant === 'bordered' && !hasError && !hasSuccess
      },
      
      // State styles
      !glassmorphism && hasError && 'border-red-500 dark:border-red-500 focus:ring-red-500',
      !glassmorphism && hasSuccess && 'border-green-500 dark:border-green-500 focus:ring-green-500',
      !glassmorphism && !hasError && !hasSuccess && {
        'focus:border-blue-500 focus:ring-blue-500': variant === 'default' || variant === 'bordered',
        'focus:border-gray-400 focus:ring-gray-400': variant === 'ghost'
      },
      
      // Neon focus effect
      neonFocus && isFocused && [
        'shadow-lg',
        hasError ? 'shadow-red-500/30' :
        hasSuccess ? 'shadow-green-500/30' :
        'shadow-blue-500/30'
      ]
    );

    const iconClasses = clsx(
      'absolute top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500',
      {
        'w-4 h-4': size === 'sm',
        'w-5 h-5': size === 'md',
        'w-6 h-6': size === 'lg'
      }
    );

    const leftIconClasses = clsx(
      iconClasses,
      {
        'left-2.5': size === 'sm',
        'left-3': size === 'md',
        'left-4': size === 'lg'
      }
    );

    const rightIconClasses = clsx(
      iconClasses,
      {
        'right-2.5': size === 'sm',
        'right-3': size === 'md', 
        'right-4': size === 'lg'
      }
    );

    return (
      <div className={containerClasses}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className={leftIconClasses}>
              {leftIcon}
            </div>
          )}
          
          <motion.input
            ref={ref}
            type={inputType}
            className={clsx(inputClasses, className)}
            disabled={disabled || loading}
            onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            animate={neonFocus && isFocused ? {
              boxShadow: hasError ? '0 0 20px rgba(239, 68, 68, 0.3)' :
                        hasSuccess ? '0 0 20px rgba(34, 197, 94, 0.3)' :
                        '0 0 20px rgba(59, 130, 246, 0.3)'
            } : {}}
            transition={{ duration: 0.2 }}
            {...(props as any)}
          />
          
          {(rightIcon || isPassword) && (
            <div className={rightIconClasses}>
              {isPassword ? (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? React.createElement(EyeOff) : React.createElement(Eye)}
                </button>
              ) : (
                rightIcon
              )}
            </div>
          )}
          
          {glassmorphism && isFocused && (
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-30" />
          )}
        </div>
        
        {description && !error && !success && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {description}
          </p>
        )}
        
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-400"
          >
            {React.createElement(AlertCircle, { className: "w-3 h-3" })}
            {error}
          </motion.div>
        )}
        
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1 flex items-center gap-1 text-xs text-green-600 dark:text-green-400"
          >
            {React.createElement(CheckCircle, { className: "w-3 h-3" })}
            {success}
          </motion.div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };