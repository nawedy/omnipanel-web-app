'use client';

import React from 'react';
import { ThemeProvider } from '@/components/ThemeProvider';
import { DatabaseProvider } from './DatabaseProvider';
import { PluginProvider } from './PluginProvider';
import { MonitoringProvider } from './MonitoringProvider';

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Combined providers component that wraps the application with all necessary providers
 * This ensures proper provider nesting order and simplifies the root layout
 * 
 * Provider order:
 * 1. MonitoringProvider (outermost) - Error handling and performance monitoring
 * 2. ThemeProvider - Theme management
 * 3. DatabaseProvider - Database access
 * 4. PluginProvider (innermost) - Plugin system
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <MonitoringProvider>
      <ThemeProvider>
        <DatabaseProvider>
          <PluginProvider>
            {children}
          </PluginProvider>
        </DatabaseProvider>
      </ThemeProvider>
    </MonitoringProvider>
  );
}
