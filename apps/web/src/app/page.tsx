'use client';

import Image from 'next/image';
import { WorkspaceLayout } from '@/components/workspace/WorkspaceLayout';

export default function HomePage() {
  return (
    <WorkspaceLayout>
      <div className="flex flex-col items-center justify-center h-full w-full p-8 text-center">
        <div className="mb-8">
          <Image 
            src="/logo.png" 
            alt="OmniPanel Logo" 
            width={120} 
            height={120} 
            className="rounded-xl shadow-lg"
          />
        </div>
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          Welcome to OmniPanel
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl">
          The ultimate AI workspace for chat, code, and creativity.
          Build amazing applications with any AI model, work anywhere, extend with plugins.
        </p>
      </div>
    </WorkspaceLayout>
  );
} 