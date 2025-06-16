// apps/web/src/app/api/research/route.ts
// Tavily API integration for AI-powered web research

import { NextRequest, NextResponse } from 'next/server';

interface TavilySearchRequest {
  query: string;
  search_depth?: 'basic' | 'advanced';
  include_answer?: boolean;
  include_raw_content?: boolean;
  max_results?: number;
  include_domains?: string[];
  exclude_domains?: string[];
}

interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
  published_date?: string;
  raw_content?: string;
}

interface TavilySearchResponse {
  answer?: string;
  query: string;
  response_time: number;
  results: TavilySearchResult[];
}

export async function POST(request: NextRequest) {
  try {
    const body: TavilySearchRequest = await request.json();
    
    // Validate required fields
    if (!body.query || typeof body.query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required and must be a string' },
        { status: 400 }
      );
    }

    // Get Tavily API key from environment
    const apiKey = process.env.TAVILY_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Tavily API key not configured' },
        { status: 500 }
      );
    }

    // Prepare Tavily API request
    const tavilyRequest = {
      api_key: apiKey,
      query: body.query,
      search_depth: body.search_depth || 'advanced',
      include_answer: body.include_answer !== false,
      include_raw_content: body.include_raw_content || false,
      max_results: Math.min(body.max_results || 10, 20), // Cap at 20 results
      include_domains: body.include_domains || [],
      exclude_domains: body.exclude_domains || []
    };

    // Make request to Tavily API
    const tavilyResponse = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tavilyRequest),
    });

    if (!tavilyResponse.ok) {
      const errorText = await tavilyResponse.text();
      console.error('Tavily API error:', errorText);
      
      return NextResponse.json(
        { 
          error: 'Research service unavailable',
          details: tavilyResponse.status === 401 ? 'Invalid API key' : 'Service error'
        },
        { status: tavilyResponse.status === 401 ? 401 : 502 }
      );
    }

    const tavilyData: TavilySearchResponse = await tavilyResponse.json();

    // Transform results to match our interface
    const transformedResults = tavilyData.results.map((result, index) => ({
      id: `result-${Date.now()}-${index}`,
      title: result.title,
      url: result.url,
      content: result.content,
      score: result.score,
      published_date: result.published_date,
      raw_content: result.raw_content
    }));

    // Return formatted response
    return NextResponse.json({
      query: tavilyData.query,
      answer: tavilyData.answer,
      response_time: tavilyData.response_time,
      results: transformedResults,
      total_results: transformedResults.length
    });

  } catch (error) {
    console.error('Research API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handle GET requests with query parameters
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || searchParams.get('query');
  
  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter is required (use ?q= or ?query=)' },
      { status: 400 }
    );
  }

  // Convert GET to POST format
  const postBody: TavilySearchRequest = {
    query,
    search_depth: (searchParams.get('depth') as 'basic' | 'advanced') || 'advanced',
    include_answer: searchParams.get('include_answer') !== 'false',
    include_raw_content: searchParams.get('include_raw_content') === 'true',
    max_results: parseInt(searchParams.get('max_results') || '10'),
  };

  // Create a new request object for the POST handler
  const postRequest = new NextRequest(request.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(postBody),
  });

  return POST(postRequest);
} 