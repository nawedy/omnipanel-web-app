// apps/docs/app/getting-started/page.tsx
// Getting Started page with proper React context and server-side rendering

'use client';

import React from 'react';
import Link from 'next/link';

export default function GettingStartedPage(): React.JSX.Element {
  return (
    <div className="prose prose-lg max-w-4xl mx-auto py-8 px-6">
      <h1>Getting Started with OmniPanel</h1>

      <p>
        Welcome to OmniPanel! This guide will help you get up and running quickly with the ultimate AI workspace for chat, code, and creativity.
      </p>

      <h2>Quick Start</h2>

      <p>
        OmniPanel is designed to be intuitive and powerful. Whether you&apos;re building AI applications, analyzing data, or managing complex projects, OmniPanel provides the tools you need.
      </p>

      <h3>Installation</h3>

      <p>
        Get started with OmniPanel in just a few simple steps:
      </p>

      <ol className="list-decimal list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
        <li>Download OmniPanel from our <Link href="/download" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 underline">downloads page</Link></li>
        <li>Install the application on your preferred platform (Windows, macOS, or Linux)</li>
        <li>Launch OmniPanel and complete the initial setup wizard</li>
        <li>Connect your AI models and configure your workspace</li>
      </ol>

      <h3>First Steps</h3>

      <p>
        Once OmniPanel is installed, you can start exploring its powerful features:
      </p>

      <h4>1. Chat Interface</h4>
      <p>
        Start a conversation with AI models directly from the chat interface. Support for multiple providers including OpenAI, Anthropic, and local models.
      </p>

      <h4>2. Code Editor</h4>
      <p>
        Write, edit, and execute code with AI assistance. Features include syntax highlighting, auto-completion, and intelligent suggestions.
      </p>

      <h4>3. Terminal Integration</h4>
      <p>
        Run commands and scripts directly within OmniPanel. Perfect for development workflows and automation tasks.
      </p>

      <h4>4. Notebook Environment</h4>
      <p>
        Create Jupyter-style notebooks for data analysis, documentation, and interactive computing.
      </p>

      <h2>Configuration</h2>

      <p>
        Configure OmniPanel to match your workflow:
      </p>

      <h3>AI Model Setup</h3>
      
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
        <code>{`// Example: Configure OpenAI
{
  "provider": "openai",
  "apiKey": "your-api-key-here",
  "model": "gpt-4",
  "temperature": 0.7
}`}</code>
      </pre>

      <h3>Workspace Settings</h3>

      <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
        <li>Choose your preferred theme (light, dark, or auto)</li>
        <li>Configure keyboard shortcuts</li>
        <li>Set up project templates</li>
        <li>Enable plugins and extensions</li>
      </ul>

      <h2>Key Features</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3">🤖 AI Chat</h3>
          <p>Conversation with multiple AI models simultaneously. Context-aware responses and memory management.</p>
        </div>
        
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3">💻 Code Editor</h3>
          <p>Full-featured code editor with AI assistance, syntax highlighting, and intelligent autocomplete.</p>
        </div>
        
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3">📊 Data Analysis</h3>
          <p>Jupyter-style notebooks for data science, visualization, and interactive computing.</p>
        </div>
        
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3">🔧 Terminal</h3>
          <p>Integrated terminal for running commands, scripts, and managing your development environment.</p>
        </div>
      </div>

      <h2>Next Steps</h2>

      <p>
        Now that you have OmniPanel set up, explore these resources to get the most out of your AI workspace:
      </p>

      <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
        <li>
          <Link href="/api" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 underline">
            API Reference
          </Link> - Learn about OmniPanel&apos;s powerful API
        </li>
        <li>
          <Link href="/guides" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 underline">
            Guides & Tutorials
          </Link> - Step-by-step tutorials for common tasks
        </li>
        <li>
          <Link href="/plugins" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 underline">
            Plugin Development
          </Link> - Create custom extensions
        </li>
        <li>
          <Link href="/cli" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 underline">
            CLI Tools
          </Link> - Command-line utilities and automation
        </li>
      </ul>

      <blockquote className="border-l-4 border-primary-500 pl-4 italic text-gray-600 dark:text-gray-400 my-6">
        <p>
          <strong>Pro tip:</strong> Use the global search (Cmd/Ctrl + K) to quickly find documentation, 
          examples, and features across OmniPanel.
        </p>
      </blockquote>

      <h2>Need Help?</h2>

      <p>
        If you run into any issues or have questions:
      </p>

      <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2">
        <li>Check our <Link href="/guides/troubleshooting" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 underline">troubleshooting guide</Link></li>
        <li>Join our <a href="https://discord.gg/omnipanel" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 underline">Discord community</a></li>
        <li>Report issues on <a href="https://github.com/omnipanel/omnipanel" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 underline">GitHub</a></li>
      </ul>

      <p>
        Welcome to the future of AI-powered development with OmniPanel! 🚀
      </p>
    </div>
  );
} 