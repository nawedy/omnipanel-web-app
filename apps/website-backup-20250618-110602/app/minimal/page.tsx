'use client';

import React from 'react';
import { SiteLayout } from '@/components/site-layout';
import { FeatureCard } from '@/components/FeatureCard';
import { ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline';

// Minimal feature for testing
const sampleFeature = {
  name: 'Multi-Model AI Chat',
  description: 'Connect with any AI model - OpenAI, Anthropic, Ollama, local models, and more.',
  icon: ChatBubbleBottomCenterTextIcon,
  color: 'blue',
};

export default function MinimalPage(): React.JSX.Element {
  return (
    <SiteLayout>
      <main>
        {/* Minimal Hero Section */}
        <section className="py-24 bg-white dark:bg-gray-900">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                Minimal Test Page
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                Testing layout with minimal components.
              </p>
            </div>
          </div>
        </section>

        {/* Minimal Features Section */}
        <section className="py-24 bg-white dark:bg-gray-900">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                Features Test
              </h2>
            </div>
            <div className="mx-auto mt-16 grid max-w-7xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Single feature card for testing */}
              <FeatureCard
                feature={sampleFeature}
                index={0}
                inView={true}
              />
            </div>
          </div>
        </section>
      </main>
    </SiteLayout>
  );
}
