// apps/web/src/app/settings/layout.tsx
// Comprehensive settings layout with navigation sidebar

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Settings, 
  Palette, 
  Keyboard, 
  Globe, 
  Database, 
  Zap, 
  Bug, 
  Puzzle, 
  Shield,
  ChevronLeft,
  Menu,
  X,
  Brain,
  Bot
} from 'lucide-react';

interface SettingsSection {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: string;
}

const SETTINGS_SECTIONS: SettingsSection[] = [
  {
    id: 'general',
    name: 'General',
    description: 'Language, timezone, and interface preferences',
    icon: Settings,
    href: '/settings'
  },
  {
    id: 'theme',
    name: 'Theme',
    description: 'Colors, fonts, and visual appearance',
    icon: Palette,
    href: '/settings/theme'
  },
  {
    id: 'keyboard',
    name: 'Keyboard Shortcuts',
    description: 'Customize keyboard shortcuts and hotkeys',
    icon: Keyboard,
    href: '/settings/keyboard'
  },
  {
    id: 'ai-models',
    name: 'AI Models',
    description: 'Configure AI providers and local models',
    icon: Bot,
    href: '/settings/ai-models'
  },
  {
    id: 'ai-rules',
    name: 'AI Rules',
    description: 'Manage AI behavior rules and templates',
    icon: Brain,
    href: '/settings/ai-rules'
  },
  {
    id: 'database',
    name: 'Database',
    description: 'Database connection and configuration',
    icon: Database,
    href: '/settings/database'
  },
  {
    id: 'performance',
    name: 'Performance',
    description: 'Performance monitoring and optimization',
    icon: Zap,
    href: '/settings/performance'
  },
  {
    id: 'plugins',
    name: 'Plugins',
    description: 'Manage extensions and integrations',
    icon: Puzzle,
    href: '/settings/plugins'
  },
  {
    id: 'errors',
    name: 'Error Tracking',
    description: 'Error monitoring and debugging',
    icon: Bug,
    href: '/settings/errors'
  },
  {
    id: 'privacy',
    name: 'Privacy',
    description: 'Privacy policy and data handling',
    icon: Shield,
    href: '/settings/privacy'
  }
];

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentSection = SETTINGS_SECTIONS.find(section => 
    section.href === pathname || (section.href !== '/settings' && pathname.startsWith(section.href))
  ) || SETTINGS_SECTIONS[0];

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link 
              href="/dashboard"
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-muted rounded-lg transition-colors lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div>
              <h1 className="text-xl font-semibold">Settings</h1>
              <p className="text-sm text-muted-foreground">
                {currentSection.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <div className="hidden lg:block w-64 border-r border-border bg-card">
          <nav className="p-4 space-y-2">
            {SETTINGS_SECTIONS.map((section) => {
              const isActive = section.href === pathname || 
                (section.href !== '/settings' && pathname.startsWith(section.href));
              
              return (
                <Link
                  key={section.id}
                  href={section.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <section.icon className="w-5 h-5" />
                  <div className="flex-1">
                    <div className="font-medium">{section.name}</div>
                    {section.badge && (
                      <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded">
                        {section.badge}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar - Mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-black/50" onClick={closeSidebar} />
            <div className="fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="font-semibold">Settings</h2>
                <button
                  onClick={closeSidebar}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <nav className="p-4 space-y-2">
                {SETTINGS_SECTIONS.map((section) => {
                  const isActive = section.href === pathname || 
                    (section.href !== '/settings' && pathname.startsWith(section.href));
                  
                  return (
                    <Link
                      key={section.id}
                      href={section.href}
                      onClick={closeSidebar}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <section.icon className="w-5 h-5" />
                      <div className="flex-1">
                        <div className="font-medium">{section.name}</div>
                        {section.badge && (
                          <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded">
                            {section.badge}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="p-6 max-w-4xl mx-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
} 