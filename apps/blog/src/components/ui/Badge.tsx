// src/components/ui/Badge.tsx
// Badge component for tags, categories, and status indicators

"use client";

import * as React from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'error' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center font-medium transition-colors'
    
    const variants = {
      default: 'bg-slate-800 text-slate-300 hover:bg-slate-700',
      secondary: 'bg-slate-700 text-slate-200 hover:bg-slate-600',
      success: 'bg-green-900/20 text-green-300 border border-green-800',
      warning: 'bg-yellow-900/20 text-yellow-300 border border-yellow-800',
      error: 'bg-red-900/20 text-red-300 border border-red-800',
      outline: 'border border-slate-600 text-slate-300 hover:bg-slate-800',
    }
    
    const sizes = {
      sm: 'px-2 py-0.5 text-xs rounded-full',
      md: 'px-3 py-1 text-sm rounded-full',
      lg: 'px-4 py-1.5 text-base rounded-full',
    }

    return (
      <div
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Badge.displayName = 'Badge'

export { Badge, type BadgeProps } 