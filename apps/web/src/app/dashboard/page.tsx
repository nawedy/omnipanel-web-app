'use client';

import React from 'react';
import { WorkspaceLayout } from '@/components/workspace/WorkspaceLayout';
import { Card } from '@omnipanel/ui';
import { useTheme } from '@/components/ThemeProvider';
import { DatabaseStatusWidget } from '@/components/dashboard/DatabaseStatusWidget';
import { PluginsWidget } from '@/components/dashboard/PluginsWidget';
import { 
  LayoutDashboard, 
  Layers, 
  Palette, 
  Database, 
  Package, 
  MessageSquare,
  Settings
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { theme, setTheme } = useTheme();
  
  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <LayoutDashboard className="w-8 h-8" />
          OmniPanel Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Welcome to OmniPanel - Your AI-powered workspace
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5" />
              Integrated Packages
            </h2>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="border border-border rounded-lg p-4 bg-background hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                    <Palette className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Theme Engine</h3>
                    <p className="text-xs text-muted-foreground">@omnipanel/theme-engine</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Unified theming system with dark mode support and theme persistence.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setTheme('light')}
                    className={`w-8 h-8 rounded-full ${theme === 'light' ? 'ring-2 ring-primary ring-offset-2' : ''} bg-white border border-gray-200`}
                    aria-label="Light theme"
                  />
                  <button
                    onClick={() => setTheme('dark')}
                    className={`w-8 h-8 rounded-full ${theme === 'dark' ? 'ring-2 ring-primary ring-offset-2' : ''} bg-gray-900 border border-gray-700`}
                    aria-label="Dark theme"
                  />
                </div>
              </div>
              
              <div className="border border-border rounded-lg p-4 bg-background hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">LLM Adapters</h3>
                    <p className="text-xs text-muted-foreground">@omnipanel/llm-adapters</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  AI model integration with streaming support and multiple model providers.
                </p>
                <Link 
                  href="/chat"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  Open Chat Interface
                </Link>
              </div>
              
              <div className="border border-border rounded-lg p-4 bg-background hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Database</h3>
                    <p className="text-xs text-muted-foreground">@omnipanel/database</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Database integration with NeonDB and connection management.
                </p>
                <Link 
                  href="/settings/database"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  Database Settings
                </Link>
              </div>
              
              <div className="border border-border rounded-lg p-4 bg-background hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Plugin SDK</h3>
                    <p className="text-xs text-muted-foreground">@omnipanel/plugin-sdk</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Extensible plugin system with sandboxed execution and plugin management.
                </p>
                <Link 
                  href="/plugins"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  View Plugins
                </Link>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Integration Status</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-background rounded-md">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span>UI Components</span>
                </div>
                <span className="text-sm text-muted-foreground">Integrated</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-background rounded-md">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span>Theme Engine</span>
                </div>
                <span className="text-sm text-muted-foreground">Integrated</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-background rounded-md">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span>LLM Adapters</span>
                </div>
                <span className="text-sm text-muted-foreground">Integrated</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-background rounded-md">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span>Database</span>
                </div>
                <span className="text-sm text-muted-foreground">Integrated</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-background rounded-md">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span>Plugin SDK</span>
                </div>
                <span className="text-sm text-muted-foreground">Integrated</span>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="space-y-6">
          <DatabaseStatusWidget />
          <PluginsWidget />
          
          <Card className="overflow-hidden">
            <div className="bg-muted/50 p-3 border-b border-border">
              <h3 className="font-medium flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Quick Actions
              </h3>
            </div>
            
            <div className="p-4 space-y-2">
              <Link 
                href="/settings/database"
                className="block p-2 hover:bg-muted rounded-md transition-colors text-sm"
              >
                Database Settings
              </Link>
              <Link 
                href="/settings/plugins"
                className="block p-2 hover:bg-muted rounded-md transition-colors text-sm"
              >
                Plugin Management
              </Link>
              <Link 
                href="/plugins"
                className="block p-2 hover:bg-muted rounded-md transition-colors text-sm"
              >
                Plugin Interface
              </Link>
              <Link 
                href="/chat"
                className="block p-2 hover:bg-muted rounded-md transition-colors text-sm"
              >
                AI Chat
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
