'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { clsx } from 'clsx';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  variant?: 'default' | 'ghost' | 'bordered';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  glassmorphism?: boolean;
  neonFocus?: boolean;
  className?: string;
}

const Select: React.FC<SelectProps> = ({
  options,
  value,
  onValueChange,
  placeholder = "Select an option...",
  disabled = false,
  error,
  label,
  variant = 'default',
  size = 'md',
  fullWidth = false,
  glassmorphism = false,
  neonFocus = false,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || '');
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(option => option.value === selectedValue);

  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    if (disabled) return;
    
    setSelectedValue(optionValue);
    setIsOpen(false);
    onValueChange?.(optionValue);
  };

  const toggleOpen = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const triggerClasses = clsx(
    // Base styles
    'relative w-full flex items-center justify-between cursor-pointer',
    'rounded-lg transition-all duration-200 border',
    'focus:outline-none focus:ring-2 focus:ring-offset-0',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    
    // Size variants
    {
      'px-3 py-1.5 text-sm': size === 'sm',
      'px-4 py-2 text-sm': size === 'md',
      'px-5 py-3 text-base': size === 'lg'
    },
    
    // Width
    fullWidth && 'w-full',
    
    // Glassmorphism
    glassmorphism && [
      'backdrop-blur-md border-white/20',
      'bg-white/10 dark:bg-white/5 text-white'
    ],
    
    // Variant styles (when not glassmorphism)
    !glassmorphism && {
      'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white':
        variant === 'default' && !error,
      'bg-transparent border-transparent text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50':
        variant === 'ghost' && !error,
      'bg-transparent border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white':
        variant === 'bordered' && !error
    },
    
    // Error state
    !glassmorphism && error && 'border-red-500 dark:border-red-500 focus:ring-red-500',
    
    // Focus states
    !glassmorphism && !error && {
      'focus:border-blue-500 focus:ring-blue-500': variant === 'default' || variant === 'bordered',
      'focus:border-gray-400 focus:ring-gray-400': variant === 'ghost'
    },
    
    // Neon effect
    neonFocus && isOpen && !glassmorphism && [
      'shadow-lg',
      error ? 'shadow-red-500/30' : 'shadow-blue-500/30'
    ]
  );

  const dropdownClasses = clsx(
    'absolute z-50 w-full mt-1 rounded-lg border shadow-lg',
    'max-h-60 overflow-auto',
    
    // Glassmorphism
    glassmorphism && [
      'backdrop-blur-md border-white/20',
      'bg-white/90 dark:bg-gray-900/90'
    ],
    
    // Default background
    !glassmorphism && 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
  );

  return (
    <div className={clsx('relative', fullWidth && 'w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      
      <div ref={selectRef} className="relative">
        <div
          className={triggerClasses}
          onClick={toggleOpen}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {selectedOption?.icon && (
              <div className="flex-shrink-0">
                {selectedOption.icon}
              </div>
            )}
            <span className={clsx(
              'truncate',
              !selectedOption && 'text-gray-400 dark:text-gray-500'
            )}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          </div>
          
          <div
            className={clsx(
              "transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          >
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
          
          {glassmorphism && isOpen && (
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-30" />
          )}
        </div>
        
        {isOpen && (
          <div
            className={clsx(
              dropdownClasses,
              "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2"
            )}
          >
            <div className="py-1">
              {options.map((option) => (
                <div
                  key={option.value}
                  className={clsx(
                    'flex items-center gap-2 px-3 py-2 cursor-pointer text-sm',
                    'hover:bg-gray-100 dark:hover:bg-gray-700',
                    'transition-colors duration-150',
                    option.disabled && 'opacity-50 cursor-not-allowed',
                    selectedValue === option.value && 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  )}
                  onClick={() => !option.disabled && handleSelect(option.value)}
                >
                  {option.icon && (
                    <div className="flex-shrink-0">
                      {option.icon}
                    </div>
                  )}
                  <span className="flex-1 truncate">{option.label}</span>
                  {selectedValue === option.value && (
                    <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
              ))}
              
              {options.length === 0 && (
                <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                  No options available
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};

export { Select };