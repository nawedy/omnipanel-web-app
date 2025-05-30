'use client';

import { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export function SearchButton(): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = (): void => {
    setIsOpen(true);
    // TODO: Implement search modal
    console.log('Search modal would open here');
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group relative flex w-full max-w-md items-center gap-3 rounded-lg bg-white px-4 py-3 text-left shadow-sm ring-1 ring-gray-300 transition-all hover:ring-primary-500 dark:bg-gray-800 dark:ring-gray-600 dark:hover:ring-primary-500"
    >
      <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 group-hover:text-primary-500" />
      <span className="flex-1 text-sm text-gray-500 dark:text-gray-400">
        Search documentation...
      </span>
      <div className="flex items-center gap-1">
        <kbd className="rounded border border-gray-200 px-1.5 py-0.5 text-xs text-gray-500 dark:border-gray-600 dark:text-gray-400">
          ⌘
        </kbd>
        <kbd className="rounded border border-gray-200 px-1.5 py-0.5 text-xs text-gray-500 dark:border-gray-600 dark:text-gray-400">
          K
        </kbd>
      </div>
    </button>
  );
} 