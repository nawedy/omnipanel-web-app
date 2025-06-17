// apps/web/src/app/settings/page.tsx
// Main settings page with navigation to different settings categories

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Settings,
  Palette,
  Brain,
  Database,
  Keyboard,
  Shield,
  Zap,
  AlertTriangle,
  Puzzle,
  ArrowRight,
  User,
  Bell,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SettingsCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
}

const settingsCategories: SettingsCategory[] = [
  {
    id: 'general',
    title: 'General',
    description: 'Basic application preferences and user settings',
    icon: User,
    href: '/settings/general',
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 'theme',
    title: 'Theme & Appearance',
    description: 'Customize colors, fonts, and visual preferences',
    icon: Palette,
    href: '/settings/theme',
    color: 'from-purple-500 to-purple-600'
  },
  {
    id: 'ai-models',
    title: 'AI Models',
    description: 'Configure AI providers, models, and API settings',
    icon: Brain,
    href: '/settings/ai-models',
    color: 'from-green-500 to-green-600'
  },
  {
    id: 'ai-rules',
    title: 'AI Rules',
    description: 'Set up AI behavior rules and automation preferences',
    icon: Zap,
    href: '/settings/ai-rules',
    color: 'from-yellow-500 to-yellow-600'
  },
  {
    id: 'database',
    title: 'Database',
    description: 'Database connections and data management settings',
    icon: Database,
    href: '/settings/database',
    color: 'from-indigo-500 to-indigo-600'
  },
  {
    id: 'keyboard',
    title: 'Keyboard Shortcuts',
    description: 'Customize keyboard shortcuts and hotkeys',
    icon: Keyboard,
    href: '/settings/keyboard',
    color: 'from-red-500 to-red-600'
  },
  {
    id: 'plugins',
    title: 'Plugins',
    description: 'Manage extensions and plugin configurations',
    icon: Puzzle,
    href: '/settings/plugins',
    color: 'from-teal-500 to-teal-600'
  },
  {
    id: 'privacy',
    title: 'Privacy & Security',
    description: 'Privacy settings and security preferences',
    icon: Shield,
    href: '/settings/privacy',
    color: 'from-orange-500 to-orange-600'
  },
  {
    id: 'performance',
    title: 'Performance',
    description: 'Performance monitoring and optimization settings',
    icon: Zap,
    href: '/settings/performance',
    color: 'from-pink-500 to-pink-600'
  },
  {
    id: 'errors',
    title: 'Error Handling',
    description: 'Error reporting and debugging preferences',
    icon: AlertTriangle,
    href: '/settings/errors',
    color: 'from-red-500 to-red-600'
  }
];

export default function SettingsPage() {
  const router = useRouter();

  const handleCategoryClick = (href: string) => {
    router.push(href);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
              <Settings className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Settings</h1>
              <p className="text-muted-foreground">
                Configure OmniPanel to match your preferences and workflow
              </p>
            </div>
          </div>
        </div>

        {/* Settings Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {settingsCategories.map((category, index) => {
            const IconComponent = category.icon;
            
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <Button
                  variant="ghost"
                  className="w-full h-auto p-0 hover:bg-transparent"
                  onClick={() => handleCategoryClick(category.href)}
                >
                  <div className="w-full bg-card hover:bg-card/80 border border-border hover:border-border/80 rounded-xl p-6 transition-all duration-200 group-hover:shadow-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${category.color} rounded-lg flex items-center justify-center`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    
                    <div className="text-left">
                      <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                        {category.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {category.description}
                      </p>
                    </div>
                  </div>
                </Button>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-12 p-6 bg-card/50 border border-border rounded-xl">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="justify-start h-auto p-4"
              onClick={() => router.push('/settings/theme')}
            >
              <Palette className="w-5 h-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Switch Theme</div>
                <div className="text-sm text-muted-foreground">Change appearance</div>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="justify-start h-auto p-4"
              onClick={() => router.push('/settings/ai-models')}
            >
              <Brain className="w-5 h-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Configure AI</div>
                <div className="text-sm text-muted-foreground">Set up AI models</div>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="justify-start h-auto p-4"
              onClick={() => router.push('/settings/keyboard')}
            >
              <Keyboard className="w-5 h-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Shortcuts</div>
                <div className="text-sm text-muted-foreground">Customize hotkeys</div>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 