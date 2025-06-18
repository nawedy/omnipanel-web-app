'use client';

import React from 'react';
import { SiteLayout } from '@/components/site-layout';

export default function TestPage(): React.JSX.Element {
  return (
    <SiteLayout>
      <div className="py-24 bg-white dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Test Page
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              This is a minimal test page to identify layout issues.
            </p>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
