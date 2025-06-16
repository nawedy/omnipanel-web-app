// apps/web/src/components/chat/ResearchChat.tsx
// AI-powered research interface with Tavily integration for web search and analysis

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  SearchIcon, 
  SendIcon, 
  BookOpenIcon, 
  ExternalLinkIcon,
  ClockIcon,
  GlobeIcon,
  FileTextIcon,
  TrendingUpIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  LoaderIcon
} from 'lucide-react';

interface ResearchResult {
  id: string;
  title: string;
  url: string;
  content: string;
  score: number;
  published_date?: string;
  raw_content?: string;
}

interface ResearchQuery {
  id: string;
  query: string;
  timestamp: Date;
  results: ResearchResult[];
  summary?: string;
  status: 'pending' | 'completed' | 'error';
}

interface ResearchChatProps {
  className?: string;
}

export function ResearchChat({ className = '' }: ResearchChatProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState<ResearchQuery[]>([]);
  const [selectedQuery, setSelectedQuery] = useState<ResearchQuery | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus();
  }, []);

  const handleSearch = async () => {
    if (!query.trim() || isSearching) return;

    const newQuery: ResearchQuery = {
      id: `research-${Date.now()}`,
      query: query.trim(),
      timestamp: new Date(),
      results: [],
      status: 'pending'
    };

    setSearchHistory(prev => [newQuery, ...prev]);
    setSelectedQuery(newQuery);
    setIsSearching(true);
    setError(null);

    try {
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          search_depth: 'advanced',
          include_answer: true,
          include_raw_content: false,
          max_results: 10
        }),
      });

      if (!response.ok) {
        throw new Error(`Research failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      const completedQuery: ResearchQuery = {
        ...newQuery,
        results: data.results || [],
        summary: data.answer || '',
        status: 'completed'
      };

      setSearchHistory(prev => 
        prev.map(q => q.id === newQuery.id ? completedQuery : q)
      );
      setSelectedQuery(completedQuery);
      
      // Scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Research failed';
      setError(errorMessage);
      
      const errorQuery: ResearchQuery = {
        ...newQuery,
        status: 'error'
      };
      
      setSearchHistory(prev => 
        prev.map(q => q.id === newQuery.id ? errorQuery : q)
      );
      setSelectedQuery(errorQuery);
    } finally {
      setIsSearching(false);
      setQuery('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusIcon = (status: ResearchQuery['status']) => {
    switch (status) {
      case 'pending':
        return <LoaderIcon className="w-4 h-4 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircleIcon className="w-4 h-4 text-red-500" />;
    }
  };

  return (
    <div className={`flex flex-col h-full bg-background ${className}`}>
      {/* Header */}
      <div className="border-b border-border bg-card p-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src="/ai-avatar.png" alt="AI Research Avatar" />
            <AvatarFallback className="bg-primary/10 text-primary">
              <SearchIcon className="w-5 h-5" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-semibold">AI Research</h1>
            <p className="text-sm text-muted-foreground">
              Powered by Tavily • Web search and analysis
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Search History Sidebar */}
        <div className="w-80 border-r border-border bg-card/50 flex flex-col">
          <div className="p-4 border-b border-border">
            <h2 className="font-medium text-sm text-muted-foreground">Research History</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {searchHistory.length > 0 ? (
              <div className="p-2 space-y-2">
                {searchHistory.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedQuery?.id === item.id
                        ? 'bg-primary/10 border border-primary/20'
                        : 'bg-background hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedQuery(item)}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      {getStatusIcon(item.status)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.query}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <ClockIcon className="w-3 h-3" />
                          <span>{formatDate(item.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                    
                    {item.status === 'completed' && (
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <FileTextIcon className="w-3 h-3" />
                          <span>{item.results.length} results</span>
                        </div>
                        {item.summary && (
                          <div className="flex items-center gap-1">
                            <TrendingUpIcon className="w-3 h-3" />
                            <span>Summary</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center">
                  <BookOpenIcon className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No research queries yet
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Start by asking a question
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Search Input */}
          <div className="p-4 border-b border-border">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask a research question..."
                  className="pl-10 pr-4 py-3 text-base"
                  disabled={isSearching}
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={!query.trim() || isSearching}
                className="px-6"
              >
                {isSearching ? (
                  <LoaderIcon className="w-4 h-4 animate-spin" />
                ) : (
                  <SendIcon className="w-4 h-4" />
                )}
              </Button>
            </div>
            
            {error && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircleIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">Research Error</span>
                </div>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
            )}
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto" ref={resultsRef}>
            {selectedQuery ? (
              <div className="p-6">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <SearchIcon className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-semibold">{selectedQuery.query}</h2>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <ClockIcon className="w-4 h-4" />
                      <span>{formatDate(selectedQuery.timestamp)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(selectedQuery.status)}
                      <span className="capitalize">{selectedQuery.status}</span>
                    </div>
                  </div>
                </div>

                {selectedQuery.status === 'completed' && (
                  <>
                    {/* AI Summary */}
                    {selectedQuery.summary && (
                      <div className="mb-8 p-4 bg-primary/5 border border-primary/10 rounded-lg">
                        <h3 className="font-medium mb-3 flex items-center gap-2">
                          <TrendingUpIcon className="w-4 h-4 text-primary" />
                          AI Summary
                        </h3>
                        <div className="prose prose-sm max-w-none">
                          <p className="text-foreground leading-relaxed">
                            {selectedQuery.summary}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Search Results */}
                    {selectedQuery.results.length > 0 && (
                      <div>
                        <h3 className="font-medium mb-4 flex items-center gap-2">
                          <GlobeIcon className="w-4 h-4" />
                          Search Results ({selectedQuery.results.length})
                        </h3>
                        
                        <div className="space-y-4">
                          {selectedQuery.results.map((result, index) => (
                            <div
                              key={result.id}
                              className="p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors"
                            >
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-foreground mb-1 line-clamp-2">
                                    {result.title}
                                  </h4>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium">
                                      #{index + 1}
                                    </span>
                                    <span className="truncate">{new URL(result.url).hostname}</span>
                                    {result.published_date && (
                                      <span>• {result.published_date}</span>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="shrink-0"
                                  onClick={() => window.open(result.url, '_blank')}
                                >
                                  <ExternalLinkIcon className="w-3 h-3" />
                                </Button>
                              </div>
                              
                              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                                {result.content}
                              </p>
                              
                              <div className="mt-3 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                  <span className="text-xs text-muted-foreground">
                                    Relevance: {Math.round(result.score * 100)}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {selectedQuery.status === 'error' && (
                  <div className="text-center py-12">
                    <AlertCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">Research Failed</h3>
                    <p className="text-muted-foreground">
                      Unable to complete the research query. Please try again.
                    </p>
                  </div>
                )}

                {selectedQuery.status === 'pending' && (
                  <div className="text-center py-12">
                    <LoaderIcon className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">Researching...</h3>
                    <p className="text-muted-foreground">
                      Searching the web and analyzing results
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center max-w-md">
                  <SearchIcon className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    AI-Powered Research
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Ask any question and get comprehensive research results with AI analysis. 
                    Powered by Tavily's advanced web search capabilities.
                  </p>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• Real-time web search</p>
                    <p>• AI-generated summaries</p>
                    <p>• Source verification</p>
                    <p>• Research history</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 