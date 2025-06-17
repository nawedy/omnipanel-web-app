'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, FileText, Code, Cpu } from 'lucide-react';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  url: string;
  type: 'guide' | 'api' | 'component';
  category: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function SearchModal({ isOpen, onClose }: SearchModalProps): React.JSX.Element | null {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mock search data - in production, this would come from a search API
  const searchData: SearchResult[] = useMemo(() => [
    {
      id: '1',
      title: 'Getting Started',
      description: 'Learn how to set up and configure OmniPanel',
      url: '/docs/getting-started',
      type: 'guide',
      category: 'Introduction'
    },
    {
      id: '2',
      title: 'Chat Interface',
      description: 'Create and manage AI chat sessions',
      url: '/docs/components/chat',
      type: 'component',
      category: 'Components'
    },
    {
      id: '3',
      title: 'Code Editor',
      description: 'Advanced code editing with AI assistance',
      url: '/docs/components/editor',
      type: 'component',
      category: 'Components'
    },
    {
      id: '4',
      title: 'LLM Adapters API',
      description: 'Connect to different language models',
      url: '/docs/api/llm-adapters',
      type: 'api',
      category: 'API Reference'
    },
    {
      id: '5',
      title: 'Terminal Integration',
      description: 'Execute commands and scripts',
      url: '/docs/components/terminal',
      type: 'component',
      category: 'Components'
    },
    {
      id: '6',
      title: 'Notebook Interface',
      description: 'Jupyter-style interactive notebooks',
      url: '/docs/components/notebook',
      type: 'component',
      category: 'Components'
    },
    {
      id: '7',
      title: 'Plugin Development',
      description: 'Create custom plugins and extensions',
      url: '/docs/guides/plugin-development',
      type: 'guide',
      category: 'Advanced'
    },
    {
      id: '8',
      title: 'Workspace API',
      description: 'Manage projects and workspaces',
      url: '/docs/api/workspace',
      type: 'api',
      category: 'API Reference'
    }
  ], []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results[selectedIndex]) {
          window.location.href = results[selectedIndex].url;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return (): void => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, results, selectedIndex]);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    
    // Simulate search delay
    const timeoutId = setTimeout((): void => {
      const filtered = searchData.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      );
      
      setResults(filtered);
      setSelectedIndex(0);
      setIsLoading(false);
    }, 200);

    return (): void => clearTimeout(timeoutId);
  }, [query, searchData]);

  const getIcon = (type: SearchResult['type']): typeof FileText => {
    switch (type) {
      case 'guide':
        return FileText;
      case 'api':
        return Cpu;
      case 'component':
        return Code;
      default:
        return FileText;
    }
  };

  const getTypeColor = (type: SearchResult['type']): string => {
    switch (type) {
      case 'guide':
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
      case 'api':
        return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30';
      case 'component':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="flex items-start justify-center pt-20">
        <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-600">
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-600">
            <Search className="h-5 w-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search documentation..."
              className="flex-1 bg-transparent text-lg outline-none dark:text-white"
            />
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
                <span className="ml-2 text-gray-500 dark:text-gray-400">Searching...</span>
              </div>
            ) : results.length > 0 ? (
              <div className="py-2">
                {results.map((result, index): React.JSX.Element => {
                  const Icon = getIcon(result.type);
                  return (
                    <a
                      key={result.id}
                      href={result.url}
                      className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                        index === selectedIndex ? 'bg-gray-50 dark:bg-gray-700' : ''
                      }`}
                    >
                      <Icon className="h-5 w-5 text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-white truncate">
                          {result.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {result.description}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(result.type)}`}>
                          {result.type}
                        </span>
                        <span className="text-xs text-gray-400">
                          {result.category}
                        </span>
                      </div>
                    </a>
                  );
                })}
              </div>
            ) : query ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <div className="text-gray-500 dark:text-gray-400">No results found for &ldquo;{query}&rdquo;</div>
                  <div className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    Try searching for components, guides, or API references
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  Start typing to search documentation...
                </div>
                <div className="mt-4 px-4">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quick links:</div>
                  <div className="grid grid-cols-2 gap-2">
                    <a href="/docs/getting-started" className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400">
                      Getting Started
                    </a>
                    <a href="/docs/components" className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400">
                      Components
                    </a>
                    <a href="/docs/api" className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400">
                      API Reference
                    </a>
                    <a href="/docs/guides" className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400">
                      Guides
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-750 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <span>↑↓ to navigate</span>
              <span>↵ to select</span>
              <span>esc to close</span>
            </div>
            <div>
              Powered by OmniPanel Search
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SearchButton(): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = (): void => {
    setIsOpen(true);
  };

  const handleClose = (): void => {
    setIsOpen(false);
  };

  // Global keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return (): void => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="group relative flex w-full max-w-md items-center gap-3 rounded-lg bg-white px-4 py-3 text-left shadow-sm ring-1 ring-gray-300 transition-all hover:ring-primary-500 dark:bg-gray-800 dark:ring-gray-600 dark:hover:ring-primary-500"
      >
        <Search className="h-5 w-5 text-gray-400 group-hover:text-primary-500" />
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
      
      <SearchModal isOpen={isOpen} onClose={handleClose} />
    </>
  );
} 