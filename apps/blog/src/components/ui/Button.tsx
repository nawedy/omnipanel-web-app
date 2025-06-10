// src/components/ui/Button.tsx
// Reusable button component with OmniPanel styling

"use client";

import * as React from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', asChild = false, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
    
    const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
      secondary: 'bg-slate-800 text-white hover:bg-slate-700 active:bg-slate-600',
      outline: 'border border-slate-600 text-white hover:bg-slate-800 hover:border-slate-500',
      ghost: 'text-slate-300 hover:text-white hover:bg-slate-800',
      destructive: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
    }
    
    const sizes = {
      sm: 'h-8 px-3 text-sm rounded-md',
      md: 'h-10 px-4 py-2 rounded-lg',
      lg: 'h-12 px-6 py-3 text-lg rounded-lg',
    }

    const Component = asChild ? 'span' : 'button'

    return (
      <Component
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

Button.displayName = 'Button'

export { Button, type ButtonProps } 