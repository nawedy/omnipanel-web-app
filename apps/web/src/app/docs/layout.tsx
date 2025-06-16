'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Book, Package, Palette, Database, MessageSquare, Layers } from 'lucide-react';

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  const navItems = [
    {
      name: 'Introduction',
      href: '/docs',
      icon: <Book className="w-4 h-4" />,
    },
    {
      name: 'UI Components',
      href: '/docs/ui',
      icon: <Layers className="w-4 h-4" />,
    },
    {
      name: 'Theme Engine',
      href: '/docs/theme-engine',
      icon: <Palette className="w-4 h-4" />,
    },
    {
      name: 'LLM Adapters',
      href: '/docs/llm-adapters',
      icon: <MessageSquare className="w-4 h-4" />,
    },
    {
      name: 'Database',
      href: '/docs/database',
      icon: <Database className="w-4 h-4" />,
    },
    {
      name: 'Plugin SDK',
      href: '/docs/plugin-sdk',
      icon: <Package className="w-4 h-4" />,
    },
  ];
  
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r border-border bg-muted/30 p-4 hidden md:block">
        <div className="mb-6">
          <h2 className="font-semibold text-lg mb-2">Documentation</h2>
          <p className="text-sm text-muted-foreground">
            Learn how to use OmniPanel packages
          </p>
        </div>
        
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'hover:bg-muted'}`}              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>
      
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto py-8 px-4">
          {children}
        </div>
      </div>
    </div>
  );
}
