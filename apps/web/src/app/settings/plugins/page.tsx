'use client';

import React from 'react';
import { PluginManager } from '@/components/settings/PluginManager';
import { Package } from 'lucide-react';

export default function PluginsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Package className="w-8 h-8" />
          Plugin Management
        </h1>
        <p className="text-muted-foreground mt-2">
          Install, enable, and configure plugins to extend OmniPanel&apos;s functionality
        </p>
      </div>
      
      <PluginManager />
    </div>
  );
}
