'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function DocsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">OmniPanel Documentation</h1>
        <p className="text-muted-foreground text-lg">
          Learn how to use the OmniPanel custom packages in your applications
        </p>
      </div>
      
      <div className="bg-app-card-gradient border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
        <p className="mb-4">
          OmniPanel is a modular AI-powered workspace built with a collection of specialized packages.
          Each package provides specific functionality that can be used independently or together to
          create powerful applications.
        </p>
        
        <p className="mb-4">
          This documentation will help you understand how to use each package effectively in your applications.
        </p>
        
        <div className="bg-background border border-border rounded-md p-4 mb-4">
          <h3 className="font-medium mb-2">Quick Installation</h3>
          <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
            <code>npm install @omnipanel/ui @omnipanel/theme-engine @omnipanel/llm-adapters @omnipanel/database @omnipanel/plugin-sdk</code>
          </pre>
        </div>
        
        <p>
          Select a package from the sidebar to learn more about its features and how to use it.
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link 
          href="/docs/ui"
          className="bg-card border border-border rounded-lg p-5 hover:border-primary/50 transition-colors"        >
          <h3 className="font-medium mb-2">UI Components</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Reusable UI components built with Tailwind CSS and React
          </p>
          <div className="flex items-center text-primary text-sm">
            Learn more <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </Link>
        
        <Link 
          href="/docs/theme-engine"
          className="bg-card border border-border rounded-lg p-5 hover:border-primary/50 transition-colors"        >
          <h3 className="font-medium mb-2">Theme Engine</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Powerful theming system with dark mode support and theme persistence
          </p>
          <div className="flex items-center text-primary text-sm">
            Learn more <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </Link>
        
        <Link 
          href="/docs/llm-adapters"
          className="bg-card border border-border rounded-lg p-5 hover:border-primary/50 transition-colors"        >
          <h3 className="font-medium mb-2">LLM Adapters</h3>
          <p className="text-sm text-muted-foreground mb-4">
            AI model integration with streaming support and multiple model providers
          </p>
          <div className="flex items-center text-primary text-sm">
            Learn more <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </Link>
        
        <Link 
          href="/docs/database"
          className="bg-card border border-border rounded-lg p-5 hover:border-primary/50 transition-colors"        >
          <h3 className="font-medium mb-2">Database</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Database integration with NeonDB and connection management
          </p>
          <div className="flex items-center text-primary text-sm">
            Learn more <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </Link>
        
        <Link 
          href="/docs/plugin-sdk"
          className="bg-card border border-border rounded-lg p-5 hover:border-primary/50 transition-colors"        >
          <h3 className="font-medium mb-2">Plugin SDK</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Extensible plugin system with sandboxed execution and plugin management
          </p>
          <div className="flex items-center text-primary text-sm">
            Learn more <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </Link>
      </div>
      
      <div className="bg-muted/30 border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Integration Examples</h2>
        <p className="mb-4">
          See how these packages work together in our example applications:
        </p>
        
        <ul className="list-disc list-inside space-y-2 mb-4">
          <li>
            <Link href="/dashboard" className="text-primary hover:underline">
              Dashboard Example
            </Link>
            {' '}- Showcases all integrated packages
          </li>
          <li>
            <Link href="/plugins" className="text-primary hover:underline">
              Plugin Showcase
            </Link>
            {' '}- Demonstrates the plugin system in action
          </li>
          <li>
            <Link href="/settings/database" className="text-primary hover:underline">
              Database Settings
            </Link>
            {' '}- Shows database integration and configuration
          </li>
        </ul>
      </div>
    </div>
  );
}
