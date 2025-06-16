// packages/ui/src/components/TextArea.tsx

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { clsx } from 'clsx';

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  variant?: 'default' | 'ghost' | 'bordered';
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  fullWidth?: boolean;
  glassmorphism?: boolean;
  neonFocus?: boolean;
  characterCount?: boolean;
  maxLength?: number;
}

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      className,
      label,
      description,
      error,
      success,
      variant = 'default',
      resize = 'vertical',
      fullWidth = false,
      disabled,
      glassmorphism = false,
      neonFocus = false,
      characterCount = false,
      maxLength,
      value,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasError = !!error;
    const hasSuccess = !!success && !hasError;
    
    const currentLength = typeof value === 'string' ? value.length : 0;

    const containerClasses = clsx(
      'relative',
      fullWidth && 'w-full'
    );

    const textareaClasses = clsx(
      // Base styles
      'w-full rounded-lg transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-0',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'placeholder:text-gray-400 dark:placeholder:text-gray-500',
      
      // Resize behavior
      {
        'resize-none': resize === 'none',
        'resize-y': resize === 'vertical',
        'resize-x': resize === 'horizontal',
        'resize': resize === 'both'
      },
      
      // Glassmorphism
      glassmorphism && [
        'backdrop-blur-md border border-white/20',
        'bg-white/10 dark:bg-white/5 text-white'
      ],
      
      // Padding
      'px-4 py-3 text-sm',
      
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

    return (
      <div className={containerClasses}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
          </label>
        )}
        
        <div className="relative">
          <motion.textarea
            {...(props as any)}
            ref={ref}
            className={textareaClasses}
            disabled={disabled}
            transition={{ duration: 0.2 }}
          />
          
          {glassmorphism && isFocused && (
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-30 pointer-events-none" />
          )}
        </div>
        
        {/* Character count */}
        {characterCount && maxLength && (
          <div className="mt-1 flex justify-end">
            <span className={clsx(
              'text-xs',
              currentLength > maxLength * 0.9 ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'
            )}>
              {currentLength}/{maxLength}
            </span>
          </div>
        )}
        
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

TextArea.displayName = 'TextArea';

export { TextArea };