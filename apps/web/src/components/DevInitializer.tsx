// apps/web/src/components/DevInitializer.tsx
// Client-side development data initializer

'use client';

import { useEffect } from 'react';
import { initializeDemoData } from '@/lib/dev-init';

export function DevInitializer() {
  useEffect(() => {
    // Only run in development
    if (process.env.NODE_ENV === 'development') {
      initializeDemoData();
    }
  }, []);

  return null;
} 