'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ArrowRight,
  BookOpen, 
  Code2, 
  Cpu,
  Sparkles,
  Rocket,
  Terminal
} from 'lucide-react';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SearchButton } from '@/components/SearchButton';

const features = [
  {
    name: 'Getting Started',
    description: 'Quick setup guides and tutorials to get you up and running with OmniPanel in minutes.',
    href: '/getting-started',
    icon: Rocket,
    color: 'text-blue-600',
  },
  {
    name: 'API Reference',
    description: 'Complete API documentation with examples and interactive playground.',
    href: '/api',
    icon: Code2,
    color: 'text-green-600',
  },
  {
    name: 'LLM Adapters',
    description: 'Learn how to integrate with different AI models and providers.',
    href: '/llm-adapters',
    icon: Cpu,
    color: 'text-purple-600',
  },
  {
    name: 'Plugin Development',
    description: 'Build and publish plugins to extend OmniPanel functionality.',
    href: '/plugins',
    icon: Sparkles,
    color: 'text-yellow-600',
  },
  {
    name: 'Guides & Tutorials',
    description: 'Step-by-step guides and best practices for using OmniPanel.',
    href: '/guides',
    icon: BookOpen,
    color: 'text-pink-600',
  },
  {
    name: 'CLI & Automation',
    description: 'Command-line tools and automation scripts for OmniPanel.',
    href: '/cli',
    icon: Terminal,
    color: 'text-indigo-600',
  },
];

const quickLinks = [
  { name: 'Installation', href: '/getting-started/installation' },
  { name: 'Configuration', href: '/getting-started/configuration' },
  { name: 'Chat API', href: '/api/chat' },
  { name: 'OpenAI Adapter', href: '/llm-adapters/openai' },
  { name: 'Plugin SDK', href: '/plugins/sdk' },
  { name: 'Troubleshooting', href: '/guides/troubleshooting' },
];

export default function HomePage(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />
      
      <main>
        {/* Hero section */}
        <div className="relative overflow-hidden bg-white dark:bg-gray-900">
          <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-20">
            <div className="mx-auto max-w-2xl flex-shrink-0 lg:mx-0 lg:max-w-xl lg:pt-8">
              <div className="mt-10 sm:mt-16 lg:mt-0">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
                  OmniPanel
                  <span className="text-primary-600"> Documentation</span>
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                  Your comprehensive guide to building with OmniPanel. 
                  Learn how to integrate AI models, build plugins, and create amazing AI-powered applications.
                </p>
                <div className="mt-10 flex items-center gap-x-6">
                  <Link
                    href="/getting-started"
                    className="rounded-md bg-primary-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                  >
                    Get Started
                  </Link>
                  <Link
                    href="/api"
                    className="text-sm font-semibold leading-6 text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400"
                  >
                    API Reference <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </div>
            <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none xl:ml-20">
              <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
                <div className="rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:rounded-2xl lg:p-4 dark:bg-gray-100/5 dark:ring-gray-100/10">
                  <div className="rounded-md bg-white shadow-2xl ring-1 ring-gray-900/10 dark:bg-gray-800 dark:ring-gray-100/10">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <div className="ml-4 text-sm text-gray-600 dark:text-gray-400">
                          OmniPanel Chat
                        </div>
                      </div>
                    </div>
                    <div className="p-6 font-mono text-sm">
                      <div className="text-green-400">$ omnipanel chat --model gpt-4</div>
                      <div className="mt-2 text-gray-600 dark:text-gray-300">
                        🤖 <span className="text-blue-400">Assistant:</span> Hello! I&apos;m ready to help you with coding, analysis, and creative tasks.
                      </div>
                      <div className="mt-2 text-gray-600 dark:text-gray-300">
                        💬 <span className="text-yellow-400">You:</span> Build a React component for user authentication
                      </div>
                      <div className="mt-2 text-gray-600 dark:text-gray-300">
                        🤖 <span className="text-blue-400">Assistant:</span> I&apos;ll create a comprehensive auth component...
                      </div>
                      <div className="mt-2 animate-pulse">
                        <span className="bg-gray-300 dark:bg-gray-600 text-transparent">█</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search section */}
        <div className="bg-gray-50 dark:bg-gray-800/50 py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                Find what you need
              </h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                Search through our comprehensive documentation to find answers quickly.
              </p>
              <div className="mt-8">
                <SearchButton />
              </div>
            </div>
          </div>
        </div>

        {/* Features section */}
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Everything you need to know
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              Comprehensive documentation covering all aspects of OmniPanel development and usage.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.name} className="group relative">
                  <Link href={feature.href} className="block">
                    <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      <feature.icon className={`h-5 w-5 flex-none ${feature.color}`} aria-hidden="true" />
                      {feature.name}
                    </dt>
                    <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-300">
                      <p className="flex-auto">{feature.description}</p>
                      <p className="mt-6">
                        <span className="inline-flex items-center gap-x-1 text-sm font-semibold leading-6 text-primary-600 group-hover:text-primary-500">
                          Learn more
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      </p>
                    </dd>
                  </Link>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Quick links section */}
        <div className="bg-gray-50 dark:bg-gray-800/50">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Quick Links
              </h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                Jump to the most commonly accessed documentation sections.
              </p>
            </div>
            <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {quickLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="group flex items-center justify-between rounded-lg border border-gray-200 bg-white px-6 py-4 shadow-sm transition-all hover:border-primary-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-primary-600"
                >
                  <span className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">
                    {link.name}
                  </span>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
} 