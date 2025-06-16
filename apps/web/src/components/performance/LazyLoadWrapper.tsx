'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Loader2 } from 'lucide-react';

interface LazyLoadWrapperProps {
  children: React.ReactNode;
  placeholder?: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
  height?: string | number;
  width?: string | number;
  className?: string;
  onVisible?: () => void;
}

/**
 * LazyLoadWrapper component for performance optimization
 * Only renders children when they come into viewport
 */
export function LazyLoadWrapper({
  children,
  placeholder,
  threshold = 0.1,
  rootMargin = '100px',
  height,
  width,
  className = '',
  onVisible
}: LazyLoadWrapperProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          onVisible?.();
          
          // Cleanup observer after becoming visible
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );
    
    observer.observe(ref.current);
    
    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, onVisible, isVisible]);

  // Set hasLoaded after a small delay to allow for transitions
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setHasLoaded(true);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const defaultPlaceholder = (
    <div className="flex items-center justify-center w-full h-full min-h-[100px] bg-muted/30 animate-pulse">
      <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
    </div>
  );

  const styles: React.CSSProperties = {
    height: height || 'auto',
    width: width || 'auto',
  };

  return (
    <div 
      ref={ref} 
      className={`lazy-load-wrapper transition-opacity duration-300 ${hasLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
      style={styles}
    >
      {isVisible ? children : (placeholder || defaultPlaceholder)}
    </div>
  );
}
