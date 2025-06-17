// apps/docs/components/ThemeProvider.tsx
// Client-side wrapper for theme-engine ThemeProvider

'use client';

import React from 'react';
import { ThemeProvider as ThemeEngineProvider } from '@omnipanel/theme-engine/react';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps): React.JSX.Element {
  return (
    <ThemeEngineProvider
      initialTheme="omnipanel-default"
      enableHotReload={process.env.NODE_ENV === 'development'}
    >
      {children}
    </ThemeEngineProvider>
  );
} 